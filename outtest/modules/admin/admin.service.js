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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../users/schemas/user.schema");
const tour_schema_1 = require("../tours/schemas/tour.schema");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const review_schema_1 = require("../reviews/schemas/review.schema");
const destination_schema_1 = require("../destinations/schemas/destination.schema");
const accommodation_schema_1 = require("../accommodations/schemas/accommodation.schema");
const guide_schema_1 = require("../guides/schemas/guide.schema");
const transport_schema_1 = require("../transport/schemas/transport.schema");
const seed_data_1 = require("../../database/seed-data");
const visit_schema_1 = require("./schemas/visit.schema");
let AdminService = class AdminService {
    constructor(userModel, tourModel, bookingModel, reviewModel, destinationModel, accommodationModel, guideModel, transportModel, visitModel) {
        this.userModel = userModel;
        this.tourModel = tourModel;
        this.bookingModel = bookingModel;
        this.reviewModel = reviewModel;
        this.destinationModel = destinationModel;
        this.accommodationModel = accommodationModel;
        this.guideModel = guideModel;
        this.transportModel = transportModel;
        this.visitModel = visitModel;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalUsers, newUsersThisMonth, newUsersLastMonth, totalBookings, bookingsThisMonth, bookingsLastMonth, revenueResult, revenueLastMonthResult, totalTours, totalReviews, totalDestinations, totalGuides, totalAccommodations, totalTransport, bookingsByStatus, revenueByMonth,] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
            this.userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            this.bookingModel.countDocuments({ isDeleted: false }),
            this.bookingModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
            this.bookingModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' } } }]),
            this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
            this.tourModel.countDocuments({ isDeleted: false }),
            this.reviewModel.countDocuments({ isDeleted: false }),
            this.destinationModel.countDocuments({ isDeleted: false }),
            this.guideModel.countDocuments({ isDeleted: false }),
            this.accommodationModel.countDocuments({ isDeleted: false }),
            this.transportModel.countDocuments({ isDeleted: false }),
            this.bookingModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            this.bookingModel.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
                { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
                { $sort: { '_id.month': 1 } },
            ]),
        ]);
        const revenue = revenueResult[0]?.total || 0;
        const revenueLastMonth = revenueLastMonthResult[0]?.total || 0;
        const revenueGrowth = revenueLastMonth > 0 ? ((revenue - revenueLastMonth) / revenueLastMonth) * 100 : 0;
        return {
            users: { total: totalUsers, thisMonth: newUsersThisMonth, growth: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0 },
            bookings: { total: totalBookings, thisMonth: bookingsThisMonth, growth: bookingsLastMonth > 0 ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 : 0 },
            revenue: { thisMonth: revenue, commission: revenueResult[0]?.commission || 0, growth: revenueGrowth },
            listings: { tours: totalTours, reviews: totalReviews, destinations: totalDestinations, guides: totalGuides, accommodations: totalAccommodations, transport: totalTransport },
            bookingsByStatus: Object.fromEntries(bookingsByStatus.map((b) => [b._id, b.count])),
            revenueByMonth,
        };
    }
    async getVisitorAnalytics() {
        const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [totalVisits, authenticatedVisits, anonymousVisits, last24HoursVisits, last24HoursAuthenticated, last24HoursAnonymous, countriesBreakdown, pagesBreakdown, last24HoursPagesBreakdown, recentVisits,] = await Promise.all([
            this.visitModel.countDocuments(),
            this.visitModel.countDocuments({ user: { $ne: null } }),
            this.visitModel.countDocuments({ user: null }),
            this.visitModel.countDocuments({ createdAt: { $gte: since24Hours } }),
            this.visitModel.countDocuments({ user: { $ne: null }, createdAt: { $gte: since24Hours } }),
            this.visitModel.countDocuments({ user: null, createdAt: { $gte: since24Hours } }),
            this.visitModel.aggregate([
                { $group: { _id: '$country', count: { $sum: 1 } } },
                { $project: { country: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } },
            ]),
            this.visitModel.aggregate([
                {
                    $project: {
                        pageUrl: {
                            $cond: [
                                { $gte: [{ $indexOfCP: ['$pageUrl', '?'] }, 0] },
                                { $substrCP: ['$pageUrl', 0, { $indexOfCP: ['$pageUrl', '?'] }] },
                                '$pageUrl',
                            ],
                        },
                    },
                },
                { $group: { _id: '$pageUrl', count: { $sum: 1 } } },
                { $project: { pageUrl: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } },
                { $limit: 15 },
            ]),
            this.visitModel.aggregate([
                { $match: { createdAt: { $gte: since24Hours } } },
                {
                    $project: {
                        pageUrl: {
                            $cond: [
                                { $gte: [{ $indexOfCP: ['$pageUrl', '?'] }, 0] },
                                { $substrCP: ['$pageUrl', 0, { $indexOfCP: ['$pageUrl', '?'] }] },
                                '$pageUrl',
                            ],
                        },
                    },
                },
                { $group: { _id: '$pageUrl', count: { $sum: 1 } } },
                { $project: { pageUrl: '$_id', count: 1, _id: 0 } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
            this.visitModel.find()
                .populate('user', 'firstName lastName email avatar')
                .sort({ createdAt: -1 })
                .limit(50)
                .lean(),
        ]);
        const uniqueCountries = countriesBreakdown.length;
        return {
            totalVisits,
            authenticatedVisits,
            anonymousVisits,
            uniqueCountries,
            countriesBreakdown,
            pagesBreakdown,
            last24Hours: {
                total: last24HoursVisits,
                authenticated: last24HoursAuthenticated,
                anonymous: last24HoursAnonymous,
                topPages: last24HoursPagesBreakdown,
            },
            recentVisits,
        };
    }
    async getUsers(query) {
        const { page = 1, limit = 20, role, q, banned } = query;
        const skip = (page - 1) * limit;
        const filter = {};
        if (role)
            filter.role = role;
        if (banned !== undefined)
            filter.isBanned = banned === 'true';
        if (q)
            filter.$or = [
                { firstName: new RegExp(q, 'i') },
                { lastName: new RegExp(q, 'i') },
                { email: new RegExp(q, 'i') },
            ];
        const [data, total] = await Promise.all([
            this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.userModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async banUser(id, banned) {
        return this.userModel.findByIdAndUpdate(id, { isBanned: banned }, { new: true }).select('-password');
    }
    async updateUserRole(id, role) {
        return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    }
    async getBookings(query) {
        const { page = 1, limit = 20, status } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        const [data, total] = await Promise.all([
            this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName email avatar').lean(),
            this.bookingModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async updateBookingStatus(id, status) {
        return this.bookingModel.findByIdAndUpdate(id, { status }, { new: true }).populate('user', 'firstName lastName email');
    }
    async getListings(type, query) {
        const { page = 1, limit = 20, q, status } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { title: new RegExp(q, 'i') },
                { description: new RegExp(q, 'i') },
                { bio: new RegExp(q, 'i') },
                { category: new RegExp(q, 'i') },
                { route: new RegExp(q, 'i') },
            ];
        }
        let model;
        let sort = { createdAt: -1 };
        switch (type) {
            case 'destinations':
                model = this.destinationModel;
                break;
            case 'tours':
                model = this.tourModel;
                break;
            case 'guides':
                model = this.guideModel;
                break;
            case 'accommodations':
                model = this.accommodationModel;
                break;
            case 'transport':
                model = this.transportModel;
                break;
            default:
                throw new common_1.BadRequestException('Invalid listing type');
        }
        const listQuery = model.find(filter).sort(sort).skip(skip).limit(limit);
        if (type === 'guides') {
            listQuery.populate('user', 'firstName lastName email');
        }
        if (type === 'accommodations') {
            listQuery.populate('owner', 'firstName lastName email');
        }
        const [data, total] = await Promise.all([
            listQuery.lean(),
            model.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async resolveDestinationId(value) {
        if (!value)
            return undefined;
        if (typeof value !== 'string')
            return undefined;
        if ((0, mongoose_2.isValidObjectId)(value))
            return new mongoose_2.Types.ObjectId(value);
        const destination = await this.destinationModel.findOne({
            $or: [
                { slug: value },
                { name: new RegExp(`^${value}$`, 'i') },
            ],
        }).lean();
        return destination?._id;
    }
    async resolveUserId(value, roles) {
        if (!value)
            return undefined;
        if (typeof value !== 'string')
            return undefined;
        if ((0, mongoose_2.isValidObjectId)(value))
            return new mongoose_2.Types.ObjectId(value);
        const emailMatch = String(value).trim().toLowerCase();
        const query = {
            $or: [
                { email: emailMatch },
                { firstName: new RegExp(`^${value}$`, 'i') },
                { lastName: new RegExp(`^${value}$`, 'i') },
            ],
        };
        if (roles)
            query.role = Array.isArray(roles) ? { $in: roles } : roles;
        const user = await this.userModel.findOne(query).lean();
        return user?._id;
    }
    async ensureFallbackDestination(data) {
        const fallbackName = 'Kenya';
        const existing = await this.destinationModel.findOne({ name: fallbackName, isDeleted: false }).lean();
        if (existing)
            return existing._id;
        const created = await this.destinationModel.create({
            name: fallbackName,
            slug: this.generateSlug(fallbackName),
            description: 'Default country destination',
            country: 'kenya',
            heroImage: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200',
            status: 'active',
            featured: false,
            isDeleted: false,
        });
        return created._id;
    }
    async resolveOrCreateDestinationId(value) {
        if (!value)
            return undefined;
        if (typeof value !== 'string')
            return undefined;
        const cleanValue = value.trim();
        if (!cleanValue)
            return undefined;
        if ((0, mongoose_2.isValidObjectId)(cleanValue))
            return new mongoose_2.Types.ObjectId(cleanValue);
        const existing = await this.destinationModel.findOne({
            $or: [
                { slug: cleanValue },
                { name: new RegExp(`^${cleanValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
            ],
            isDeleted: false
        }).lean();
        if (existing)
            return existing._id;
        const fallbackSlug = this.generateSlug(cleanValue);
        const created = await this.destinationModel.create({
            name: cleanValue,
            slug: fallbackSlug,
            description: `Auto-created destination for ${cleanValue}`,
            country: 'kenya',
            heroImage: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200',
            status: 'active',
            featured: false,
            isDeleted: false,
        });
        return created._id;
    }
    buildSlug(value) {
        return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    async ensureUniqueSlug(model, value, fallback = 'listing') {
        const baseSlug = this.buildSlug(value || fallback) || fallback;
        const escaped = baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existing = await model.findOne({ slug: { $regex: `^${escaped}(?:-\\d+)?$`, $options: 'i' } }).lean();
        if (!existing)
            return baseSlug;
        let counter = 2;
        let candidate = `${baseSlug}-${counter}`;
        while (await model.findOne({ slug: candidate }).lean()) {
            counter += 1;
            candidate = `${baseSlug}-${counter}`;
        }
        return candidate;
    }
    async createListing(type, data) {
        switch (type) {
            case 'destinations': {
                const slug = data.slug || this.generateSlug(data.name);
                return this.destinationModel.create({ ...data, slug, status: data.status || 'active' });
            }
            case 'tours': {
                const slug = data.slug || this.generateSlug(data.title);
                if (data.destination) {
                    const resolvedDestination = await this.resolveOrCreateDestinationId(data.destination);
                    if (resolvedDestination) {
                        data.destination = resolvedDestination;
                    }
                    else {
                        data.destination = await this.ensureFallbackDestination(data);
                    }
                }
                else {
                    data.destination = await this.ensureFallbackDestination(data);
                }
                if (data.operator) {
                    const resolvedOperator = await this.resolveUserId(data.operator, ['operator', 'admin']);
                    if (resolvedOperator) {
                        data.operator = resolvedOperator;
                    }
                    else {
                        const op = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean();
                        if (op)
                            data.operator = op._id;
                    }
                }
                else {
                    const op = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean();
                    if (op)
                        data.operator = op._id;
                }
                if (!data.destination) {
                    throw new common_1.BadRequestException('A valid destination is required for tours');
                }
                if (!data.operator) {
                    throw new common_1.BadRequestException('A valid operator is required for tours');
                }
                if (!data.images && data.heroImage)
                    data.images = [data.heroImage];
                if (!data.images)
                    data.images = ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600'];
                if (!data.heroImage)
                    data.heroImage = 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600';
                return this.tourModel.create({ ...data, slug, status: data.status || 'active', instantBooking: data.instantBooking ?? true });
            }
            case 'guides': {
                if (data.user) {
                    const resolvedGuideUser = await this.resolveUserId(data.user, 'guide');
                    if (resolvedGuideUser)
                        data.user = resolvedGuideUser;
                }
                else {
                    const guideUser = await this.userModel.findOne({ role: 'guide' }).lean();
                    if (guideUser)
                        data.user = guideUser._id;
                }
                if (!data.languages)
                    data.languages = ['English', 'Swahili'];
                return this.guideModel.create({ ...data, status: data.status || 'active' });
            }
            case 'accommodations': {
                const trimmedName = typeof data.name === 'string' ? data.name.trim() : '';
                if (trimmedName)
                    data.name = trimmedName;
                if (!trimmedName) {
                    throw new common_1.BadRequestException('A valid name is required for accommodations');
                }
                const slug = (typeof data.slug === 'string' && data.slug.trim())
                    ? data.slug.trim()
                    : await this.ensureUniqueSlug(this.accommodationModel, trimmedName, 'accommodation');
                if (data.destination) {
                    const resolvedDestination = await this.resolveOrCreateDestinationId(data.destination);
                    if (resolvedDestination) {
                        data.destination = resolvedDestination;
                    }
                    else {
                        data.destination = await this.ensureFallbackDestination(data);
                    }
                }
                else {
                    data.destination = await this.ensureFallbackDestination(data);
                }
                if (data.owner) {
                    const resolvedOwner = await this.resolveUserId(data.owner, ['operator', 'admin']);
                    if (resolvedOwner) {
                        data.owner = resolvedOwner;
                    }
                    else {
                        const owner = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean();
                        if (owner)
                            data.owner = owner._id;
                    }
                }
                else {
                    const owner = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean();
                    if (owner)
                        data.owner = owner._id;
                }
                if (!data.images && data.heroImage)
                    data.images = [data.heroImage];
                if (!data.images)
                    data.images = ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600'];
                if (!data.heroImage)
                    data.heroImage = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600';
                if (!data.destination) {
                    throw new common_1.BadRequestException('A valid destination is required for accommodations');
                }
                if (!data.owner) {
                    throw new common_1.BadRequestException('A valid owner is required for accommodations');
                }
                return this.accommodationModel.create({ ...data, slug, status: data.status || 'active' });
            }
            case 'transport': {
                const trimmedName = typeof data.name === 'string' ? data.name.trim() : '';
                if (!trimmedName) {
                    throw new common_1.BadRequestException('A valid name is required for transport listings');
                }
                data.name = trimmedName;
                if (!data.type || !['bus', 'car', 'flight', 'ferry'].includes(String(data.type))) {
                    throw new common_1.BadRequestException('Transport type must be bus, car, flight, or ferry');
                }
                if (!data.route || !String(data.route).trim()) {
                    throw new common_1.BadRequestException('A valid route is required for transport listings');
                }
                if (data.price === undefined || data.price === null || Number(data.price) < 0) {
                    throw new common_1.BadRequestException('A valid price is required for transport listings');
                }
                if (!data.description) {
                    data.description = 'Reliable transport service for travellers.';
                }
                if (!data.currency)
                    data.currency = 'USD';
                if (!data.image)
                    data.image = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800';
                const slug = (typeof data.slug === 'string' && data.slug.trim())
                    ? data.slug.trim()
                    : await this.ensureUniqueSlug(this.transportModel, trimmedName, 'transport');
                return this.transportModel.create({ ...data, slug, status: data.status || 'active', isDeleted: false });
            }
            default:
                throw new common_1.BadRequestException('Invalid listing type');
        }
    }
    async deleteListing(type, id) {
        let model;
        switch (type) {
            case 'destinations':
                model = this.destinationModel;
                break;
            case 'tours':
                model = this.tourModel;
                break;
            case 'guides':
                model = this.guideModel;
                break;
            case 'accommodations':
                model = this.accommodationModel;
                break;
            case 'transport':
                model = this.transportModel;
                break;
            default: throw new common_1.BadRequestException('Invalid listing type');
        }
        const item = await model.findByIdAndUpdate(id, { isDeleted: true, status: 'inactive' }, { new: true });
        if (!item)
            throw new common_1.NotFoundException('Listing not found');
        return { message: 'Listing deleted successfully' };
    }
    async updateListing(type, id, data) {
        let model;
        switch (type) {
            case 'destinations': {
                model = this.destinationModel;
                break;
            }
            case 'tours': {
                model = this.tourModel;
                if (data.destination) {
                    const resolvedDestination = await this.resolveOrCreateDestinationId(data.destination);
                    if (resolvedDestination) {
                        data.destination = resolvedDestination;
                    }
                    else {
                        data.destination = await this.ensureFallbackDestination(data);
                    }
                }
                if (data.operator) {
                    const resolvedOperator = await this.resolveUserId(data.operator, ['operator', 'admin']);
                    if (resolvedOperator)
                        data.operator = resolvedOperator;
                }
                if (data.heroImage) {
                    data.images = [data.heroImage];
                }
                break;
            }
            case 'guides': {
                model = this.guideModel;
                if (data.user) {
                    const resolvedGuideUser = await this.resolveUserId(data.user, 'guide');
                    if (resolvedGuideUser)
                        data.user = resolvedGuideUser;
                }
                break;
            }
            case 'accommodations': {
                model = this.accommodationModel;
                if (typeof data.name === 'string' && data.name.trim()) {
                    data.name = data.name.trim();
                }
                if (typeof data.name === 'string' && data.name.trim() && !data.slug) {
                    data.slug = await this.ensureUniqueSlug(this.accommodationModel, String(data.name).trim(), 'accommodation');
                }
                if (data.destination) {
                    const resolvedDestination = await this.resolveOrCreateDestinationId(data.destination);
                    if (resolvedDestination) {
                        data.destination = resolvedDestination;
                    }
                    else {
                        data.destination = await this.ensureFallbackDestination(data);
                    }
                }
                if (data.owner) {
                    const resolvedOwner = await this.resolveUserId(data.owner, ['operator', 'admin']);
                    if (resolvedOwner)
                        data.owner = resolvedOwner;
                }
                if (data.heroImage) {
                    data.images = [data.heroImage];
                }
                break;
            }
            case 'transport': {
                model = this.transportModel;
                if (typeof data.name === 'string' && data.name.trim()) {
                    data.name = data.name.trim();
                }
                if (typeof data.name === 'string' && data.name.trim() && !data.slug) {
                    data.slug = await this.ensureUniqueSlug(this.transportModel, String(data.name).trim(), 'transport');
                }
                if (data.type && !['bus', 'car', 'flight', 'ferry'].includes(String(data.type))) {
                    throw new common_1.BadRequestException('Transport type must be bus, car, flight, or ferry');
                }
                if (data.price !== undefined && data.price !== null) {
                    data.price = Number(data.price);
                }
                break;
            }
            default:
                throw new common_1.BadRequestException('Invalid listing type');
        }
        const item = await model.findByIdAndUpdate(id, { $set: data }, { new: true });
        if (!item)
            throw new common_1.NotFoundException('Listing not found');
        return item;
    }
    async updateListingStatus(type, id, status) {
        let model;
        switch (type) {
            case 'destinations':
                model = this.destinationModel;
                break;
            case 'tours':
                model = this.tourModel;
                break;
            case 'guides':
                model = this.guideModel;
                break;
            case 'accommodations':
                model = this.accommodationModel;
                break;
            case 'transport':
                model = this.transportModel;
                break;
            default:
                throw new common_1.BadRequestException('Invalid listing type');
        }
        const item = await model.findByIdAndUpdate(id, { status }, { new: true });
        if (!item)
            throw new common_1.NotFoundException('Listing not found');
        return item;
    }
    generateSlug(value) {
        return `${(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;
    }
    async getReviews(query) {
        const { page = 1, limit = 20, approved } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (approved !== undefined)
            filter.approved = approved === 'true';
        const [data, total] = await Promise.all([
            this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName email').lean(),
            this.reviewModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async approveReview(id) {
        return this.reviewModel.findByIdAndUpdate(id, { approved: true }, { new: true });
    }
    async deleteReview(id) {
        return this.reviewModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
    async seedDatabase() {
        try {
            const userCount = await this.userModel.countDocuments();
            if (userCount > 0) {
                return {
                    success: false,
                    message: 'Database already seeded',
                    details: `Found ${userCount} existing users. Skipping seed to avoid duplicates.`,
                    tip: 'To re-seed, clear the database collections first.',
                };
            }
            console.log('🌱 Starting database seed...');
            const seedData = await (0, seed_data_1.generateSeedData)();
            const results = {};
            if (seedData.collections.users?.length > 0) {
                const users = await this.userModel.insertMany(seedData.collections.users);
                results.users = users.length;
                console.log(`✅ Seeded ${users.length} users`);
            }
            if (seedData.collections.destinations?.length > 0) {
                const destinations = await this.destinationModel.insertMany(seedData.collections.destinations);
                results.destinations = destinations.length;
                console.log(`✅ Seeded ${destinations.length} destinations`);
            }
            if (seedData.collections.tours?.length > 0) {
                const tours = await this.tourModel.insertMany(seedData.collections.tours);
                results.tours = tours.length;
                console.log(`✅ Seeded ${tours.length} tours`);
            }
            if (seedData.collections.guides?.length > 0) {
                const guides = await this.guideModel.insertMany(seedData.collections.guides);
                results.guides = guides.length;
                console.log(`✅ Seeded ${guides.length} guides`);
            }
            if (seedData.collections.accommodations?.length > 0) {
                const accommodations = await this.accommodationModel.insertMany(seedData.collections.accommodations);
                results.accommodations = accommodations.length;
                console.log(`✅ Seeded ${accommodations.length} accommodations`);
            }
            if (seedData.collections.transport?.length > 0) {
                const transports = await this.transportModel.insertMany(seedData.collections.transport);
                results.transport = transports.length;
                console.log(`✅ Seeded ${transports.length} transport listings`);
            }
            if (seedData.collections.reviews?.length > 0) {
                const reviews = await this.reviewModel.insertMany(seedData.collections.reviews);
                results.reviews = reviews.length;
                console.log(`✅ Seeded ${reviews.length} reviews`);
            }
            console.log('\n🎉 Database seeded successfully!');
            return {
                success: true,
                message: '✅ Database seeded successfully!',
                details: results,
                loginCredentials: {
                    admin: { email: 'tembeaafricake@gmail.com', password: 'Hamp9map....#' },
                    guide: { email: 'joseph@tembeaafrica.com', password: 'Admin@123' },
                    tourist: { email: 'john@example.com', password: 'Admin@123' },
                    operator: { email: 'operator@marasafaris.com', password: 'Admin@123' },
                },
                nextSteps: [
                    'Login with any of the provided credentials',
                    'Explore destinations, tours, guides, and accommodations',
                    'To add more seed data in future: update src/database/seed-data.ts and call this endpoint again',
                ],
            };
        }
        catch (error) {
            console.error('❌ Seed failed:', error.message);
            throw new common_1.BadRequestException({
                success: false,
                message: 'Database seeding failed',
                error: error.message,
                tip: 'Ensure MongoDB connection is active and collections are accessible.',
            });
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(tour_schema_1.Tour.name)),
    __param(2, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(3, (0, mongoose_1.InjectModel)(review_schema_1.Review.name)),
    __param(4, (0, mongoose_1.InjectModel)(destination_schema_1.Destination.name)),
    __param(5, (0, mongoose_1.InjectModel)(accommodation_schema_1.Accommodation.name)),
    __param(6, (0, mongoose_1.InjectModel)(guide_schema_1.Guide.name)),
    __param(7, (0, mongoose_1.InjectModel)(transport_schema_1.Transport.name)),
    __param(8, (0, mongoose_1.InjectModel)(visit_schema_1.Visit.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map