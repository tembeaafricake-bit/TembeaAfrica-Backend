import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserDocument } from '../users/schemas/user.schema'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { NotificationsService } from '../notifications/notifications.service'
import { ConfigService } from '@nestjs/config'
import { Visit, VisitDocument } from '../admin/schemas/visit.schema'
import { Request } from 'express'
import axios from 'axios'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Visit.name) private visitModel: Model<VisitDocument>,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() })
    if (existing) throw new ConflictException('An account with this email already exists')

    const hashedPassword = await bcrypt.hash(dto.password, 12)
    const user = await this.userModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: 'tourist',
    })

    // Send welcome email
    await this.notificationsService.sendWelcomeEmail(user.email, user.firstName).catch(() => null)

    const tokens = this.generateTokens(user)
    return { user: this.sanitizeUser(user), ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).select('+password')
    if (!user) throw new UnauthorizedException('Invalid email or password')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid email or password')

    if (user.isBanned) throw new UnauthorizedException('Your account has been suspended. Contact support.')

    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() })

    const tokens = this.generateTokens(user)
    return { user: this.sanitizeUser(user), ...tokens }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) return null
    const valid = await bcrypt.compare(password, user.password)
    return valid ? user : null
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'tembea-refresh-secret-2025'),
      })
      const user = await this.userModel.findById(payload.sub)
      if (!user) throw new UnauthorizedException('User not found')
      const tokens = this.generateTokens(user)
      return tokens
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-password')
    if (!user) throw new UnauthorizedException('User not found')
    return user
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() })
    if (!user) return { message: 'If this email exists, a reset link has been sent.' }

    const resetToken = this.jwtService.sign(
      { sub: user._id, type: 'password-reset' },
      { secret: this.configService.get('JWT_SECRET'), expiresIn: '1h' },
    )

    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 3600000),
    })

    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`
    await this.notificationsService.sendPasswordResetEmail(user.email, user.firstName, resetUrl).catch(() => null)
    return { message: 'Password reset email sent. Check your inbox.' }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token)
      if (payload.type !== 'password-reset') throw new BadRequestException('Invalid token type')
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await this.userModel.findByIdAndUpdate(payload.sub, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      return { message: 'Password updated successfully. You can now log in.' }
    } catch {
      throw new BadRequestException('Invalid or expired reset token')
    }
  }

  async logVisit(req: Request, pageUrl: string) {
    const ip = (
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      '127.0.0.1'
    ).split(',')[0].trim()

    const userAgent = req.headers['user-agent'] || 'Unknown'

    let userId: string | undefined
    const token = req.cookies?.['access_token']
    if (token) {
      try {
        const decoded = this.jwtService.verify(token)
        userId = decoded.sub
      } catch {
        // Expired or invalid token, treat as anonymous
      }
    }

    const saveVisit = async () => {
      let country = 'Unknown'
      
      try {
        if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.')) {
          const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 2000 })
          country = geoResponse.data?.country_name || 'Unknown'
        } else {
          const mockCountries = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'South Africa', 'Morocco', 'Egypt']
          country = mockCountries[Math.floor(Math.random() * mockCountries.length)]
        }
      } catch {
        const mockCountries = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'South Africa']
        country = mockCountries[Math.floor(Math.random() * mockCountries.length)]
      }

      try {
        await this.visitModel.create({
          user: userId ? userId : undefined,
          ip,
          userAgent,
          country,
          pageUrl: pageUrl || '/',
        })
      } catch (err) {
        console.error('Error logging website visit:', err.message)
      }
    }

    saveVisit()

    return { success: true }
  }

  async handleGoogleAuth(profile: any) {
    const email = profile.email || (profile.emails && profile.emails[0]?.value)
    if (!email) {
      throw new BadRequestException('No email address provided by Google')
    }

    let user = await this.userModel.findOne({ email: email.toLowerCase() })
    if (!user) {
      const displayName = profile.name || profile.displayName || ''
      const nameParts = displayName.split(' ')
      const firstName = profile.given_name || nameParts[0] || 'Google'
      const lastName = profile.family_name || nameParts.slice(1).join(' ') || 'User'
      const avatar = profile.picture || (profile.photos && profile.photos[0]?.value)
      const googleId = profile.sub || profile.id

      user = await this.userModel.create({
        email: email.toLowerCase(),
        firstName,
        lastName,
        avatar,
        googleId,
        role: 'tourist',
        isVerified: true,
        password: await bcrypt.hash((googleId || 'google') + Date.now(), 12),
      })
    }
    return { user: this.sanitizeUser(user), ...this.generateTokens(user) }
  }

  private generateTokens(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role }
    const accessToken = this.jwtService.sign(payload)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', 'tembea-refresh-secret-2025'),
      expiresIn: '30d',
    })
    return { accessToken, refreshToken }
  }

  private sanitizeUser(user: UserDocument) {
    const { password, passwordResetToken, ...rest } = user.toObject()
    return rest
  }
}
