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
exports.DestinationSchema = exports.Destination = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Coordinates = class Coordinates {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Coordinates.prototype, "lat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Coordinates.prototype, "lng", void 0);
Coordinates = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Coordinates);
let Destination = class Destination {
};
exports.Destination = Destination;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Destination.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Destination.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['kenya', 'tanzania'], required: true }),
    __metadata("design:type", String)
], Destination.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Destination.prototype, "county", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Destination.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Destination.prototype, "shortDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Destination.prototype, "heroImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Destination.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Coordinates }),
    __metadata("design:type", Coordinates)
], Destination.prototype, "coordinates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 5 }),
    __metadata("design:type", Number)
], Destination.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Destination.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Destination.prototype, "tourCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Destination.prototype, "hotelCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Destination.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Destination.prototype, "bestTimeToVisit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Destination.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'inactive'] }),
    __metadata("design:type", String)
], Destination.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Destination.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Destination.prototype, "travelTips", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Destination.prototype, "visaInfo", void 0);
exports.Destination = Destination = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'destinations' })
], Destination);
exports.DestinationSchema = mongoose_1.SchemaFactory.createForClass(Destination);
exports.DestinationSchema.index({ country: 1 });
exports.DestinationSchema.index({ featured: 1 });
exports.DestinationSchema.index({ rating: -1 });
exports.DestinationSchema.index({ slug: 1 }, { unique: true });
exports.DestinationSchema.index({ name: 'text', description: 'text', tags: 'text' });
//# sourceMappingURL=destination.schema.js.map