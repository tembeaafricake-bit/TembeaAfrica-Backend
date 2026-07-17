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
exports.AccommodationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const accommodations_service_1 = require("./accommodations.service");
let AccommodationsController = class AccommodationsController {
    constructor(accommodationsService) {
        this.accommodationsService = accommodationsService;
    }
    findAll(query) { return this.accommodationsService.findAll(query); }
    getFeatured() { return this.accommodationsService.findFeatured(); }
    findOne(slug) { return this.accommodationsService.findBySlug(slug); }
    checkAvailability(id, body) {
        return this.accommodationsService.checkAvailability(id, body.checkIn, body.checkOut, body.guests);
    }
};
exports.AccommodationsController = AccommodationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all accommodations with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured accommodations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an accommodation by slug' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/check-availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Check accommodation availability' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccommodationsController.prototype, "checkAvailability", null);
exports.AccommodationsController = AccommodationsController = __decorate([
    (0, swagger_1.ApiTags)('accommodations'),
    (0, common_1.Controller)('accommodations'),
    __metadata("design:paramtypes", [accommodations_service_1.AccommodationsService])
], AccommodationsController);
//# sourceMappingURL=accommodations.controller.js.map