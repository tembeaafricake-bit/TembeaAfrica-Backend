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
exports.ToursService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tour_schema_1 = require("./schemas/tour.schema");
const destination_schema_1 = require("../destinations/schemas/destination.schema");
let ToursService = class ToursService {
    constructor(tourModel, destinationModel) {
        this.tourModel = tourModel;
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
        const { page = 1, limit = 12, destination, category, minPrice, maxPrice, rating, q, sort = 'rating', featured, instantBooking } = query;
        const skip = (page - 1) * limit;
        const filter = { status: 'active', isDeleted: false };
        const destinationId = await this.resolveDestinationId(destination);
        if (destination && destinationId) {
            filter.destination = destinationId;
        }
        else if (destination) {
            return { data: [], total: 0, page, limit, totalPages: 0 };
        }
        if (category)
            filter.category = category;
        if (featured !== undefined)
            filter.featured = featured;
        if (instantBooking !== undefined)
            filter.instantBooking = instantBooking;
        if (minPrice || maxPrice)
            filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
        if (rating)
            filter.rating = { $gte: Number(rating) };
        if (q)
            filter.$text = { $search: q };
        const sortMap = {
            rating: { rating: -1 },
            'price-asc': { price: 1 },
            'price-desc': { price: -1 },
            newest: { createdAt: -1 },
            popular: { totalBookings: -1 },
        };
        const sortObj = sortMap[sort] || { rating: -1 };
        const [data, total] = await Promise.all([
            this.tourModel.find(filter).sort(sortObj).skip(skip).limit(limit)
                .populate('destination', 'name slug country heroImage')
                .populate('operator', 'firstName lastName avatar')
                .lean(),
            this.tourModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findFeatured() {
        const data = await this.tourModel.find({ featured: true, status: 'active', isDeleted: false })
            .sort({ rating: -1 }).limit(9)
            .populate('destination', 'name slug country heroImage')
            .populate('operator', 'firstName lastName avatar')
            .lean();
        return { data };
    }
    async findBySlug(slug) {
        const query = { isDeleted: false };
        const titleQuery = slug.replace(/-/g, ' ');
        if ((0, mongoose_2.isValidObjectId)(slug)) {
            query.$or = [
                { _id: slug },
                { slug },
                { title: new RegExp('^' + titleQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            ];
        }
        else {
            query.$or = [
                { slug },
                { title: new RegExp('^' + titleQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
            ];
        }
        const tour = await this.tourModel.findOne(query)
            .populate('destination', 'name slug country heroImage coordinates description')
            .populate('operator', 'firstName lastName avatar email phone')
            .lean();
        if (!tour)
            throw new common_1.NotFoundException(`Tour '${slug}' not found`);
        return tour;
    }
    async findById(id) {
        const tour = await this.tourModel.findById(id).populate('destination operator').lean();
        if (!tour)
            throw new common_1.NotFoundException('Tour not found');
        return tour;
    }
    async findByDestination(destinationId, limit = 6) {
        return this.tourModel.find({ destination: destinationId, status: 'active', isDeleted: false })
            .sort({ rating: -1 }).limit(limit)
            .populate('operator', 'firstName lastName avatar')
            .lean();
    }
    async checkAvailability(tourId, date, guests) {
        const tour = await this.tourModel.findById(tourId);
        if (!tour)
            throw new common_1.NotFoundException('Tour not found');
        if (guests > tour.groupSize)
            throw new common_1.BadRequestException(`Maximum group size is ${tour.groupSize}`);
        const isAvailable = tour.availability.length === 0 || tour.availability.includes(date);
        return { available: isAvailable, date, guests, price: tour.price * guests, tourId };
    }
    async create(data) {
        const slug = this.generateSlug(data.title);
        const tour = await this.tourModel.create({ ...data, slug });
        return tour;
    }
    async update(id, data) {
        const tour = await this.tourModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!tour)
            throw new common_1.NotFoundException('Tour not found');
        return tour;
    }
    async delete(id) {
        await this.tourModel.findByIdAndUpdate(id, { isDeleted: true });
        return { message: 'Tour deleted successfully' };
    }
    async updateRating(tourId, newRating, reviewCount) {
        await this.tourModel.findByIdAndUpdate(tourId, { rating: newRating, reviewCount });
    }
    async incrementBookings(tourId) {
        await this.tourModel.findByIdAndUpdate(tourId, { $inc: { totalBookings: 1 } });
    }
    generateSlug(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
    }
};
exports.ToursService = ToursService;
exports.ToursService = ToursService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tour_schema_1.Tour.name)),
    __param(1, (0, mongoose_1.InjectModel)(destination_schema_1.Destination.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ToursService);
//# sourceMappingURL=tours.service.js.map