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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("./schemas/review.schema");
let ReviewsService = class ReviewsService {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(userId, data) {
        const existing = await this.reviewModel.findOne({ user: userId, targetType: data.targetType, targetId: data.targetId });
        if (existing)
            throw new common_1.BadRequestException('You have already reviewed this item');
        const review = await this.reviewModel.create({ ...data, user: userId });
        await this.recalculateRating(data.targetType, data.targetId);
        return review;
    }
    async findForTarget(targetType, targetId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const filter = { targetType, targetId, approved: true, isDeleted: false };
        const [data, total] = await Promise.all([
            this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName avatar nationality').lean(),
            this.reviewModel.countDocuments(filter),
        ]);
        const avgRating = await this.reviewModel.aggregate([
            { $match: filter },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit), avgRating: avgRating[0]?.avg || 0 };
    }
    async update(id, userId, data) {
        const review = await this.reviewModel.findById(id);
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.user.toString() !== userId)
            throw new common_1.ForbiddenException('Not your review');
        Object.assign(review, data);
        return review.save();
    }
    async delete(id, userId, isAdmin = false) {
        const review = await this.reviewModel.findById(id);
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (!isAdmin && review.user.toString() !== userId)
            throw new common_1.ForbiddenException('Not your review');
        review.isDeleted = true;
        await review.save();
        await this.recalculateRating(review.targetType, review.targetId);
        return { message: 'Review deleted' };
    }
    async findAll(query) {
        const { page = 1, limit = 20, approved, targetType } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (approved !== undefined)
            filter.approved = approved === 'true';
        if (targetType)
            filter.targetType = targetType;
        const [data, total] = await Promise.all([
            this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName email').lean(),
            this.reviewModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async approve(id) {
        return this.reviewModel.findByIdAndUpdate(id, { approved: true }, { new: true });
    }
    async recalculateRating(targetType, targetId) {
        const result = await this.reviewModel.aggregate([
            { $match: { targetType, targetId, approved: true, isDeleted: false } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);
        return { avg: result[0]?.avg || 0, count: result[0]?.count || 0 };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map