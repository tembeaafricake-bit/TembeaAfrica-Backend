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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuideSchema = exports.Guide = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Guide = class Guide {
};
exports.Guide = Guide;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Guide.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Guide.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['English', 'Swahili'] }),
    __metadata("design:type", Array)
], Guide.prototype, "languages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Guide.prototype, "certifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Guide.prototype, "specializations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Guide.prototype, "experience", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Guide.prototype, "hourlyRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, default: 0 }),
    __metadata("design:type", Number)
], Guide.prototype, "dailyRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Guide.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Guide.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Guide.prototype, "portfolio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Guide.prototype, "avatar", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Guide.prototype, "availability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['safari', 'mountain', 'cultural', 'city', 'photography'], required: true }),
    __metadata("design:type", String)
], Guide.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Guide.prototype, "verified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'inactive', 'suspended'] }),
    __metadata("design:type", String)
], Guide.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Guide.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Destination' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Guide.prototype, "primaryDestination", void 0);
exports.Guide = Guide = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'guides' })
], Guide);
exports.GuideSchema = mongoose_1.SchemaFactory.createForClass(Guide);
exports.GuideSchema.index({ user: 1 });
exports.GuideSchema.index({ category: 1 });
exports.GuideSchema.index({ rating: -1 });
exports.GuideSchema.index({ verified: 1 });
exports.GuideSchema.index({ dailyRate: 1 });
//# sourceMappingURL=guide.schema.js.map