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
exports.DestinationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const destination_schema_1 = require("./schemas/destination.schema");
let DestinationsService = class DestinationsService {
    constructor(destModel) {
        this.destModel = destModel;
    }
    async findAll(query) {
        const { page = 1, limit = 20, country, q, sort = 'rating' } = query;
        const skip = (page - 1) * limit;
        const filter = { status: 'active', isDeleted: false };
        if (country)
            filter.country = country;
        if (q)
            filter.$text = { $search: q };
        const sortMap = { rating: { rating: -1 }, name: { name: 1 }, newest: { createdAt: -1 } };
        const [data, total] = await Promise.all([
            this.destModel.find(filter).sort(sortMap[sort] || { rating: -1 }).skip(skip).limit(limit).lean(),
            this.destModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findFeatured() {
        const data = await this.destModel.find({ featured: true, status: 'active', isDeleted: false }).sort({ rating: -1 }).limit(8).lean();
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
        const dest = await this.destModel.findOne(query).lean();
        if (!dest)
            throw new common_1.NotFoundException(`Destination '${slug}' not found`);
        return dest;
    }
    async findByCountry(country) {
        return this.destModel.find({ country, status: 'active', isDeleted: false }).sort({ featured: -1, rating: -1 }).lean();
    }
    async create(data) {
        const slug = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return this.destModel.create({ ...data, slug });
    }
    async update(id, data) {
        const dest = await this.destModel.findByIdAndUpdate(id, data, { new: true });
        if (!dest)
            throw new common_1.NotFoundException('Destination not found');
        return dest;
    }
};
exports.DestinationsService = DestinationsService;
exports.DestinationsService = DestinationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(destination_schema_1.Destination.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DestinationsService);
//# sourceMappingURL=destinations.service.js.map