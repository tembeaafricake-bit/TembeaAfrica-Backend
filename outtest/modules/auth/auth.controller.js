"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return { user: result.user };
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return { user: result.user };
    }
    async refresh(req, bodyRefreshToken, res) {
        const token = bodyRefreshToken || req.cookies?.['refresh_token'];
        if (!token) {
            throw new common_1.UnauthorizedException('No refresh token provided');
        }
        const tokens = await this.authService.refreshToken(token);
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return { success: true };
    }
    async getMe(user) {
        return this.authService.getMe(user.userId);
    }
    async forgotPassword(email) {
        return this.authService.forgotPassword(email);
    }
    async resetPassword(token, password) {
        return this.authService.resetPassword(token, password);
    }
    async logout(res) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'Logged out successfully' };
    }
    async logVisit(req, pageUrl) {
        return this.authService.logVisit(req, pageUrl);
    }
    async googleAuth(req, res) {
        const host = req.get('host') || 'localhost:3001';
        const protocol = req.protocol || 'http';
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`;
        const scope = 'openid profile email';
        const responseType = 'code';
        const nextPath = req.query.next || '';
        const state = nextPath ? `next=${encodeURIComponent(nextPath)}` : '';
        if (!clientId) {
            return res.status(500).json({ error: 'Google OAuth not configured' });
        }
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=${responseType}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `access_type=offline` +
            (state ? `&state=${encodeURIComponent(state)}` : '');
        return res.redirect(googleAuthUrl);
    }
    async googleCallback(req, res) {
        const code = req.query.code;
        const state = req.query.state;
        const nextPath = state?.startsWith('next=') ? decodeURIComponent(state.slice(5)) : '';
        const host = req.get('host') || 'localhost:3001';
        const protocol = req.protocol || 'http';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        if (!code) {
            return res.redirect(`${frontendUrl}/auth/login?error=google_missing_code`);
        }
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`;
        if (!clientId || !clientSecret) {
            return res.redirect(`${frontendUrl}/auth/login?error=google_oauth_not_configured`);
        }
        try {
            const tokenResponse = await axios_1.default.post(tokenEndpoint, new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const { access_token } = tokenResponse.data;
            const userInfoResponse = await axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const authResult = await this.authService.handleGoogleAuth(userInfoResponse.data);
            const isProd = process.env.NODE_ENV === 'production';
            res.cookie('access_token', authResult.accessToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
            res.cookie('refresh_token', authResult.refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            const params = new URLSearchParams({
                googleLoginSuccess: 'true',
                ...(nextPath ? { next: nextPath } : {}),
            });
            return res.redirect(`${frontendUrl}/auth/login?${params.toString()}`);
        }
        catch (error) {
            return res.redirect(`${frontendUrl}/auth/login?error=google_auth_failed`);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user account' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('refreshToken')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('visit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Log a website visit' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('pageUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logVisit", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, swagger_1.ApiOperation)({ summary: 'Redirect to Google OAuth login' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)(['google/callback', 'callback/google']),
    (0, swagger_1.ApiOperation)({ summary: 'Google OAuth callback handler' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map