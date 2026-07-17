"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const config_1 = require("@nestjs/config");
const visit_schema_1 = require("../admin/schemas/visit.schema");
const axios_1 = __importDefault(require("axios"));
let AuthService = class AuthService {
    constructor(userModel, visitModel, jwtService, notificationsService, configService) {
        this.userModel = userModel;
        this.visitModel = visitModel;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
        this.configService = configService;
    }
    async register(dto) {
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (existing)
            throw new common_1.ConflictException('An account with this email already exists');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userModel.create({
            ...dto,
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            role: 'tourist',
        });
        await this.notificationsService.sendWelcomeEmail(user.email, user.firstName).catch(() => null);
        const tokens = this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async login(dto) {
        const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).select('+password');
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (user.isBanned)
            throw new common_1.UnauthorizedException('Your account has been suspended. Contact support.');
        await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
        const tokens = this.generateTokens(user);
        return { user: this.sanitizeUser(user), ...tokens };
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user)
            return null;
        const valid = await bcrypt.compare(password, user.password);
        return valid ? user : null;
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET', 'tembea-refresh-secret-2025'),
            });
            const user = await this.userModel.findById(payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const tokens = this.generateTokens(user);
            return tokens;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getMe(userId) {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return user;
    }
    async forgotPassword(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            return { message: 'If this email exists, a reset link has been sent.' };
        const resetToken = this.jwtService.sign({ sub: user._id, type: 'password-reset' }, { secret: this.configService.get('JWT_SECRET'), expiresIn: '1h' });
        await this.userModel.findByIdAndUpdate(user._id, {
            passwordResetToken: resetToken,
            passwordResetExpires: new Date(Date.now() + 3600000),
        });
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;
        await this.notificationsService.sendPasswordResetEmail(user.email, user.firstName, resetUrl).catch(() => null);
        return { message: 'Password reset email sent. Check your inbox.' };
    }
    async resetPassword(token, newPassword) {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.type !== 'password-reset')
                throw new common_1.BadRequestException('Invalid token type');
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await this.userModel.findByIdAndUpdate(payload.sub, {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            });
            return { message: 'Password updated successfully. You can now log in.' };
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
    }
    async logVisit(req, pageUrl) {
        const ip = (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.ip ||
            '127.0.0.1').split(',')[0].trim();
        const userAgent = String(req.headers['user-agent'] || 'Unknown');
        const botPattern = /(bot|crawler|spider|crawl|curl|wget|python|httpclient|scrapy|postman|headless|phantom|bingpreview)/i;
        if (botPattern.test(userAgent)) {
            return { success: true };
        }
        let userId;
        const token = req.cookies?.['access_token'];
        if (token) {
            try {
                const decoded = this.jwtService.verify(token);
                userId = decoded.sub;
            }
            catch {
            }
        }
        const normalizedPageUrl = (() => {
            const path = String(pageUrl || '/').split('?')[0].trim();
            if (!path.startsWith('/'))
                return '/' + path.replace(/^\/+/, '');
            return path === '' ? '/' : path.replace(/\/+$/, '') || '/';
        })();
        const saveVisit = async () => {
            let country = 'Unknown';
            const isLocal = ip === '127.0.0.1' || ip === '::1' || /^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);
            try {
                if (!isLocal && ip) {
                    const geoResponse = await axios_1.default.get(`https://ipapi.co/${ip}/json/`, { timeout: 2000 });
                    country = geoResponse.data?.country_name || 'Unknown';
                }
                else {
                    country = 'Local Network';
                }
            }
            catch {
                country = 'Unknown';
            }
            try {
                await this.visitModel.create({
                    user: userId,
                    ip,
                    userAgent,
                    country,
                    pageUrl: normalizedPageUrl,
                });
            }
            catch (err) {
                console.error('Error logging website visit:', err.message);
            }
        };
        saveVisit();
        return { success: true };
    }
    async handleGoogleAuth(profile) {
        const email = profile.email || (profile.emails && profile.emails[0]?.value);
        if (!email) {
            throw new common_1.BadRequestException('No email address provided by Google');
        }
        let user = await this.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            const displayName = profile.name || profile.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = profile.given_name || nameParts[0] || 'Google';
            const lastName = profile.family_name || nameParts.slice(1).join(' ') || 'User';
            const avatar = profile.picture || (profile.photos && profile.photos[0]?.value);
            const googleId = profile.sub || profile.id;
            user = await this.userModel.create({
                email: email.toLowerCase(),
                firstName,
                lastName,
                avatar,
                googleId,
                role: 'tourist',
                isVerified: true,
                password: await bcrypt.hash((googleId || 'google') + Date.now(), 12),
            });
        }
        return { user: this.sanitizeUser(user), ...this.generateTokens(user) };
    }
    generateTokens(user) {
        const payload = { sub: user._id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'tembea-refresh-secret-2025'),
            expiresIn: '30d',
        });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { password, passwordResetToken, ...rest } = user.toObject();
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(visit_schema_1.Visit.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map