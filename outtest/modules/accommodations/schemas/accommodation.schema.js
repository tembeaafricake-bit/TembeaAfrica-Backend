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
exports.AccommodationSchema = exports.Accommodation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Room = class Room {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Room.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Room.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Room.prototype, "pricePerNight", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Room.prototype, "maxGuests", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Room.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Room.prototype, "amenities", void 0);
Room = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Room);
let Accommodation = class Accommodation {
};
exports.Accommodation = Accommodation;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Accommodation.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Accommodation.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['hotel', 'bnb', 'guesthouse', 'hostel', 'lodge', 'resort', 'villa', 'camping', 'restaurant'], required: true }),
    __metadata("design:type", String)
], Accommodation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Destination', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Accommodation.prototype, "destination", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Accommodation.prototype, "owner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Accommodation.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Accommodation.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Accommodation.prototype, "pricePerNight", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD' }),
    __metadata("design:type", String)
], Accommodation.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Accommodation.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Accommodation.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Accommodation.prototype, "amenities", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Room], default: [] }),
    __metadata("design:type", Array)
], Accommodation.prototype, "rooms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: { lat: Number, lng: Number } }),
    __metadata("design:type", Object)
], Accommodation.prototype, "coordinates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Accommodation.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] }),
    __metadata("design:type", String)
], Accommodation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Accommodation.prototype, "isDeleted", void 0);
exports.Accommodation = Accommodation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'accommodations' })
], Accommodation);
exports.AccommodationSchema = mongoose_1.SchemaFactory.createForClass(Accommodation);
exports.AccommodationSchema.index({ destination: 1 });
exports.AccommodationSchema.index({ type: 1 });
exports.AccommodationSchema.index({ pricePerNight: 1 });
exports.AccommodationSchema.index({ rating: -1 });
exports.AccommodationSchema.index({ featured: 1 });
exports.AccommodationSchema.index({ name: 'text', description: 'text' });
//# sourceMappingURL=accommodation.schema.js.map