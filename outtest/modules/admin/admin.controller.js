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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminController = class AdminController {
    constructor(adminService, configService) {
        this.adminService = adminService;
        this.configService = configService;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }
    async uploadImage(files) {
        const uploadFile = files?.image?.[0] || files?.file?.[0] || files?.heroImage?.[0] || files?.heroImageFile?.[0];
        if (!uploadFile?.buffer?.length) {
            throw new common_1.BadRequestException('Image file is required');
        }
        const fallbackUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200';
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        if (!cloudName || !apiKey || !apiSecret) {
            return { url: fallbackUrl };
        }
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: 'tembea-africa/admin' }, (error, uploadResult) => {
                    if (error)
                        return reject(error);
                    resolve(uploadResult);
                });
                stream_1.Readable.from(uploadFile.buffer).pipe(uploadStream);
            });
            return { url: result.secure_url };
        }
        catch (error) {
            console.error('Cloudinary upload failed, falling back to placeholder image:', error);
            return { url: fallbackUrl };
        }
    }
    getStats() { return this.adminService.getDashboardStats(); }
    getAnalytics() { return this.adminService.getVisitorAnalytics(); }
    seedDatabase() { return this.adminService.seedDatabase(); }
    getUsers(query) { return this.adminService.getUsers(query); }
    banUser(id, banned) { return this.adminService.banUser(id, banned); }
    updateRole(id, role) { return this.adminService.updateUserRole(id, role); }
    getBookings(query) { return this.adminService.getBookings(query); }
    updateBookingStatus(id, status) { return this.adminService.updateBookingStatus(id, status); }
    getListings(type, query) {
        return this.adminService.getListings(type, query);
    }
    createListing(type, body) {
        return this.adminService.createListing(type, body);
    }
    updateListing(type, id, body) {
        return this.adminService.updateListing(type, id, body);
    }
    getReviews(query) { return this.adminService.getReviews(query); }
    approveReview(id) { return this.adminService.approveReview(id); }
    deleteReview(id) { return this.adminService.deleteReview(id); }
    deleteListing(type, id) {
        return this.adminService.deleteListing(type, id);
    }
    updateListingStatus(type, id, status) {
        return this.adminService.updateListingStatus(type, id, status);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('upload-image'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an admin image to Cloudinary' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'file', maxCount: 1 },
        { name: 'heroImage', maxCount: 1 },
        { name: 'heroImageFile', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get visitor analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, swagger_1.ApiOperation)({ summary: 'Seed database with initial test data (admin only, idempotent)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "seedDatabase", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id/ban'),
    (0, swagger_1.ApiOperation)({ summary: 'Ban or unban a user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('banned')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "banUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Get)('bookings'),
    (0, swagger_1.ApiOperation)({ summary: 'List all bookings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getBookings", null);
__decorate([
    (0, common_1.Patch)('bookings/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update booking status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateBookingStatus", null);
__decorate([
    (0, common_1.Get)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'List admin-managed listings' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getListings", null);
__decorate([
    (0, common_1.Post)('listings'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a destination, tour, guide, accommodation, or transport listing' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createListing", null);
__decorate([
    (0, common_1.Patch)('listings/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing listing (destination, tour, guide, accommodation, or transport)' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateListing", null);
__decorate([
    (0, common_1.Get)('reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'List all reviews' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Patch)('reviews/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveReview", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a review' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteReview", null);
__decorate([
    (0, common_1.Delete)(':type/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a listing' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteListing", null);
__decorate([
    (0, common_1.Patch)(':type/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update listing status' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateListingStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService, config_1.ConfigService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map