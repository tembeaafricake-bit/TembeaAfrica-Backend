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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const uuid_1 = require("uuid");
const booking_schema_1 = require("./schemas/booking.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let BookingsService = class BookingsService {
    constructor(bookingModel, notificationsService, eventEmitter) {
        this.bookingModel = bookingModel;
        this.notificationsService = notificationsService;
        this.eventEmitter = eventEmitter;
    }
    async create(userId, data) {
        const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const serviceFee = Math.round(subtotal * 0.08);
        const totalAmount = subtotal + serviceFee;
        const commissionAmount = Math.round(subtotal * 0.10);
        const booking = await this.bookingModel.create({
            bookingNumber: 'TA-' + (0, uuid_1.v4)().substring(0, 8).toUpperCase(),
            user: userId,
            items: data.items,
            guestDetails: data.guestDetails,
            subtotal,
            serviceFee,
            totalAmount,
            commissionAmount,
            commissionRate: 0.10,
            currency: data.currency || 'USD',
            startDate: data.startDate,
            endDate: data.endDate,
            guests: data.guests || 1,
            paymentMethod: data.paymentMethod || 'paystack',
            status: 'pending',
            paymentStatus: 'unpaid',
        });
        this.eventEmitter.emit('booking.created', { booking, userId });
        await this.notificationsService.sendBookingPendingEmail(booking.user.email || data.guestDetails?.email, booking.user.firstName || data.guestDetails?.firstName || 'Guest', booking.bookingNumber, booking.totalAmount).catch(() => null);
        return booking;
    }
    async findMyBookings(userId) {
        return this.bookingModel.find({ user: userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .lean();
    }
    async findOne(id, userId) {
        const booking = await this.bookingModel.findById(id)
            .populate('user', 'firstName lastName email phone')
            .lean();
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (userId && booking.user && booking.user._id?.toString() !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return booking;
    }
    async findByNumber(bookingNumber) {
        const booking = await this.bookingModel.findOne({ bookingNumber })
            .populate('user', 'firstName lastName email')
            .lean();
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async cancel(id, userId, reason) {
        const booking = await this.bookingModel.findById(id);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.user.toString() !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (['cancelled', 'completed'].includes(booking.status)) {
            throw new common_1.BadRequestException(`Cannot cancel a ${booking.status} booking`);
        }
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by guest';
        booking.cancelledAt = new Date();
        await booking.save();
        this.eventEmitter.emit('booking.cancelled', { booking });
        return booking;
    }
    async confirm(id, paymentReference) {
        const booking = await this.bookingModel.findByIdAndUpdate(id, {
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentReference,
            confirmedAt: new Date(),
        }, { new: true }).populate('user', 'firstName lastName email');
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        this.eventEmitter.emit('booking.confirmed', { booking });
        await this.notificationsService.sendBookingConfirmation(booking.user.email, booking.user.firstName, booking.bookingNumber, booking.totalAmount).catch(() => null);
        return booking;
    }
    async complete(id) {
        return this.bookingModel.findByIdAndUpdate(id, { status: 'completed' }, { new: true });
    }
    async findAll(query) {
        const { page = 1, limit = 20, status, paymentStatus, startDate, endDate } = query;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (startDate && endDate)
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        const [data, total] = await Promise.all([
            this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('user', 'firstName lastName email avatar').lean(),
            this.bookingModel.countDocuments(filter),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getStats() {
        const [totalRevenue, totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
            this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' } } }]),
            this.bookingModel.countDocuments({ isDeleted: false }),
            this.bookingModel.countDocuments({ status: 'pending' }),
            this.bookingModel.countDocuments({ status: 'confirmed' }),
        ]);
        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCommission: totalRevenue[0]?.commission || 0,
            totalBookings,
            pendingBookings,
            confirmedBookings,
        };
    }
    async getMonthlyRevenue() {
        return this.bookingModel.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
        ]);
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_service_1.NotificationsService,
        event_emitter_1.EventEmitter2])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map