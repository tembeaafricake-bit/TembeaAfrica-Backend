import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import axios from 'axios'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user account' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto)
    const frontendUrl = process.env.FRONTEND_URL || ''
    const crossSite = frontendUrl && !frontendUrl.includes('localhost')
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { user: result.user }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto)
    const frontendUrl = process.env.FRONTEND_URL || ''
    const crossSite = frontendUrl && !frontendUrl.includes('localhost')

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })
    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return { user: result.user }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(
    @Req() req: Request,
    @Body('refreshToken') bodyRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = bodyRefreshToken || req.cookies?.['refresh_token']
    if (!token) {
      throw new UnauthorizedException('No refresh token provided')
    }
    
    const tokens = await this.authService.refreshToken(token)
    const isProd = process.env.NODE_ENV === 'production'

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    })
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return { success: true }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  async getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getMe(user.userId)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.authService.resetPassword(token, password)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return { message: 'Logged out successfully' }
  }

  @Post('visit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log a website visit' })
  async logVisit(
    @Req() req: Request,
    @Body('pageUrl') pageUrl: string,
  ) {
    return this.authService.logVisit(req, pageUrl)
  }

  @Get('google')
  @ApiOperation({ summary: 'Redirect to Google OAuth login' })
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    const host = req.get('host') || 'localhost:3001'
    const protocol = req.protocol || 'http'
    const clientId = process.env.GOOGLE_CLIENT_ID
    
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`
    
    const scope = 'openid profile email'
    const responseType = 'code'
    const nextPath = (req.query.next as string) || ''
    const state = nextPath ? new URLSearchParams({ next: nextPath }).toString() : ''

    if (!clientId) {
      return res.status(500).json({ error: 'Google OAuth not configured' })
    }

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline` +
      (state ? `&state=${encodeURIComponent(state)}` : '')

    return res.redirect(googleAuthUrl)
  }

  @Get(['google/callback', 'callback/google'])
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const code = req.query.code as string
    const state = req.query.state as string
    const nextPath = state ? new URLSearchParams(state).get('next') || '' : ''
    const host = req.get('host') || 'localhost:3001'
    const protocol = req.protocol || 'http'
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    if (!code) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_missing_code`)
    }

    const tokenEndpoint = 'https://oauth2.googleapis.com/token'
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_oauth_not_configured`)
    }

    try {
      const tokenResponse = await axios.post(tokenEndpoint, new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const { access_token } = tokenResponse.data
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      const authResult = await this.authService.handleGoogleAuth(userInfoResponse.data)
      const frontendUrl = process.env.FRONTEND_URL || ''
      const crossSite = frontendUrl && !frontendUrl.includes('localhost')

      res.cookie('access_token', authResult.accessToken, {
        httpOnly: true,
        secure: crossSite,
        sameSite: crossSite ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })
      res.cookie('refresh_token', authResult.refreshToken, {
        httpOnly: true,
        secure: crossSite,
        sameSite: crossSite ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })

      const params = new URLSearchParams({
        googleLoginSuccess: 'true',
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        ...(nextPath ? { next: nextPath } : {}),
      })
      return res.redirect(`${frontendUrl}/auth/login?${params.toString()}`)
    } catch (error: any) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
      const errorDescription = encodeURIComponent(
        error?.response?.data?.error_description ||
        error?.response?.data?.error ||
        error?.message ||
        'google_auth_failed',
      )
      return res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed&errorDescription=${errorDescription}`)
    }
  }
}
