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
exports.GuidesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const guide_schema_1 = require("./schemas/guide.schema");
let GuidesService = class GuidesService {
    constructor(guideModel) {
        this.guideModel = guideModel;
    }
    async findAll(query) {
        const { page = 1, limit = 20, category, q, verified, sort = 'rating' } = query;
        const skip = (page - 1) * limit;
        const filter = { status: 'active', isDeleted: false };
        if (category)
            filter.category = category;
        if (verified !== undefined)
            filter.verified = verified === 'true' || verified === true;
        if (q)
            filter.$or = [
                { bio: new RegExp(q, 'i') },
                { specializations: new RegExp(q, 'i') },
            ];
        const sortMap = {
            rating: { rating: -1 },
            'rate-asc': { dailyRate: 1 },
            experience: { experience: -1 },
        };
        const [data, total] = await Promise.all([
            this.guideModel.find(filter).sort(sortMap[sort] || { rating: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName avatar email')
                .populate('primaryDestination', 'name slug country')
                .lean(),
            this.guideModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findFeatured() {
        const data = await this.guideModel.find({ status: 'active', isDeleted: false, verified: true })
            .sort({ rating: -1 }).limit(8)
            .populate('user', 'firstName lastName avatar')
            .lean();
        return { data };
    }
    async findById(id) {
        const guide = await this.guideModel.findOne({ _id: id, isDeleted: false })
            .populate('user', 'firstName lastName avatar email phone')
            .populate('primaryDestination', 'name slug country heroImage')
            .lean();
        if (!guide)
            throw new common_1.NotFoundException('Guide not found');
        return guide;
    }
    async checkAvailability(guideId, date) {
        const guide = await this.guideModel.findById(guideId);
        if (!guide)
            throw new common_1.NotFoundException('Guide not found');
        const isAvailable = guide.availability.length === 0 || guide.availability.includes(date);
        return { available: isAvailable, date, dailyRate: guide.dailyRate, guideId };
    }
};
exports.GuidesService = GuidesService;
exports.GuidesService = GuidesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(guide_schema_1.Guide.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GuidesService);
//# sourceMappingURL=guides.service.js.map