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
exports.TransportSchema = exports.Transport = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Transport = class Transport {
};
exports.Transport = Transport;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transport.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ sparse: true, unique: true }),
    __metadata("design:type", String)
], Transport.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['bus', 'car', 'flight', 'ferry'], required: true }),
    __metadata("design:type", String)
], Transport.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transport.prototype, "route", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Transport.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD' }),
    __metadata("design:type", String)
], Transport.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transport.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Transport.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Transport.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transport.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Transport.prototype, "image", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] }),
    __metadata("design:type", String)
], Transport.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Transport.prototype, "isDeleted", void 0);
exports.Transport = Transport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'transport' })
], Transport);
exports.TransportSchema = mongoose_1.SchemaFactory.createForClass(Transport);
exports.TransportSchema.index({ type: 1 });
exports.TransportSchema.index({ route: 'text', name: 'text', description: 'text' });
exports.TransportSchema.index({ price: 1 });
exports.TransportSchema.index({ rating: -1 });
exports.TransportSchema.index({ status: 1, isDeleted: 1 });
//# sourceMappingURL=transport.schema.js.map