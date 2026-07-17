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
exports.AccommodationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const accommodation_schema_1 = require("./schemas/accommodation.schema");
const destination_schema_1 = require("../destinations/schemas/destination.schema");
let AccommodationsService = class AccommodationsService {
    constructor(accommodationModel, destinationModel) {
        this.accommodationModel = accommodationModel;
        this.destinationModel = destinationModel;
    }
    async resolveDestinationId(destination) {
        if (!destination)
            return undefined;
        const value = destination.toString().toLowerCase().trim();
        if ((0, mongoose_2.isValidObjectId)(value))
            return value;
        const slug = value.replace(/\s+/g, '-');
        const destinationDoc = await this.destinationModel.findOne({
            isDeleted: false,
            $or: [
                { _id: value },
                { slug: value },
                { slug },
                { name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            ],
        }).select('_id').lean();
        return destinationDoc?._id;
    }
    async findAll(query) {
        const { page = 1, limit = 12, type, destination, minPrice, maxPrice, q, sort = 'rating' } = query;
        const skip = (page - 1) * limit;
        const filter = { status: 'active', isDeleted: false };
        if (type)
            filter.type = type;
        const destinationId = await this.resolveDestinationId(destination);
        if (destination && destinationId) {
            filter.destination = destinationId;
        }
        else if (destination) {
            return { data: [], total: 0, page, limit, totalPages: 0 };
        }
        if (minPrice || maxPrice)
            filter.pricePerNight = {
                ...(minPrice && { $gte: Number(minPrice) }),
                ...(maxPrice && { $lte: Number(maxPrice) }),
            };
        if (q)
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
            ];
        const sortMap = {
            rating: { rating: -1 },
            'price-asc': { pricePerNight: 1 },
            'price-desc': { pricePerNight: -1 },
        };
        const [data, total] = await Promise.all([
            this.accommodationModel.find(filter).sort(sortMap[sort] || { rating: -1 }).skip(skip).limit(limit)
                .populate('destination', 'name slug country')
                .lean(),
            this.accommodationModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findFeatured() {
        const data = await this.accommodationModel.find({ featured: true, status: 'active', isDeleted: false })
            .sort({ rating: -1 }).limit(6)
            .populate('destination', 'name slug country')
            .lean();
        return { data };
    }
    async findBySlug(slug) {
        const query = { isDeleted: false };
        const nameQuery = slug.replace(/-/g, ' ');
        if ((0, mongoose_2.isValidObjectId)(slug)) {
            query.$or = [
                { _id: slug },
                { slug },
                { name: new RegExp('^' + nameQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            ];
        }
        else {
            query.$or = [
                { slug },
                { name: new RegExp('^' + nameQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            ];
        }
        const stay = await this.accommodationModel.findOne(query)
            .populate('destination', 'name slug country heroImage')
            .populate('owner', 'firstName lastName avatar email')
            .lean();
        if (!stay)
            throw new common_1.NotFoundException(`Accommodation '${slug}' not found`);
        return stay;
    }
    async checkAvailability(id, checkIn, checkOut, guests) {
        const stay = await this.accommodationModel.findById(id);
        if (!stay)
            throw new common_1.NotFoundException('Accommodation not found');
        if (guests < 1)
            throw new common_1.BadRequestException('At least 1 guest required');
        const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
        return { available: true, checkIn, checkOut, guests, nights, totalPrice: stay.pricePerNight * nights, accommodationId: id };
    }
};
exports.AccommodationsService = AccommodationsService;
exports.AccommodationsService = AccommodationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(accommodation_schema_1.Accommodation.name)),
    __param(1, (0, mongoose_1.InjectModel)(destination_schema_1.Destination.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], AccommodationsService);
//# sourceMappingURL=accommodations.service.js.map