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
exports.TourSchema = exports.Tour = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ItineraryDay = class ItineraryDay {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ItineraryDay.prototype, "day", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ItineraryDay.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ItineraryDay.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], ItineraryDay.prototype, "activities", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], ItineraryDay.prototype, "meals", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ItineraryDay.prototype, "accommodation", void 0);
ItineraryDay = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ItineraryDay);
let PricingTier = class PricingTier {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PricingTier.prototype, "minGuests", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PricingTier.prototype, "maxGuests", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], PricingTier.prototype, "pricePerPerson", void 0);
PricingTier = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PricingTier);
let Tour = class Tour {
};
exports.Tour = Tour;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Tour.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Tour.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tour.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tour.prototype, "shortDescription", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Destination', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Tour.prototype, "destination", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Tour.prototype, "operator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['safari', 'beach', 'adventure', 'cultural', 'mountain', 'city', 'daytrip', 'multiday'], required: true }),
    __metadata("design:type", String)
], Tour.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tour.prototype, "videoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Tour.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PricingTier] }),
    __metadata("design:type", Array)
], Tour.prototype, "pricingTiers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', enum: ['USD', 'KES', 'TZS', 'EUR', 'GBP'] }),
    __metadata("design:type", String)
], Tour.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Tour.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], Tour.prototype, "groupSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0 }),
    __metadata("design:type", Number)
], Tour.prototype, "minAge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Tour.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Tour.prototype, "reviewCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Tour.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Tour.prototype, "instantBooking", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ItineraryDay], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "itinerary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "includes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "excludes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "highlights", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Tour.prototype, "availability", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Tour.prototype, "cancellationPolicy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] }),
    __metadata("design:type", String)
], Tour.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Tour.prototype, "totalBookings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Tour.prototype, "isDeleted", void 0);
exports.Tour = Tour = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'tours' })
], Tour);
exports.TourSchema = mongoose_1.SchemaFactory.createForClass(Tour);
exports.TourSchema.index({ destination: 1 });
exports.TourSchema.index({ category: 1 });
exports.TourSchema.index({ price: 1 });
exports.TourSchema.index({ rating: -1 });
exports.TourSchema.index({ featured: 1 });
exports.TourSchema.index({ status: 1, isDeleted: 1 });
exports.TourSchema.index({ slug: 1 }, { unique: true });
exports.TourSchema.index({ title: 'text', description: 'text', tags: 'text' });
//# sourceMappingURL=tour.schema.js.map