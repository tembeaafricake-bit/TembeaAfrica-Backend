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
exports.GuidesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const guides_service_1 = require("./guides.service");
let GuidesController = class GuidesController {
    constructor(guidesService) {
        this.guidesService = guidesService;
    }
    findAll(query) { return this.guidesService.findAll(query); }
    getFeatured() { return this.guidesService.findFeatured(); }
    findOne(id) { return this.guidesService.findById(id); }
    checkAvailability(id, body) {
        return this.guidesService.checkAvailability(id, body.date);
    }
};
exports.GuidesController = GuidesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all guides with filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuidesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured guides' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GuidesController.prototype, "getFeatured", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a guide by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GuidesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/check-availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Check guide availability' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GuidesController.prototype, "checkAvailability", null);
exports.GuidesController = GuidesController = __decorate([
    (0, swagger_1.ApiTags)('guides'),
    (0, common_1.Controller)('guides'),
    __metadata("design:paramtypes", [guides_service_1.GuidesService])
], GuidesController);
//# sourceMappingURL=guides.controller.js.map