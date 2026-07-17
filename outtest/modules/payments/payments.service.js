"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const bookings_service_1 = require("../bookings/bookings.service");
const notifications_service_1 = require("../notifications/notifications.service");
let PaymentsService = class PaymentsService {
    constructor(configService, bookingsService, notificationsService) {
        this.configService = configService;
        this.bookingsService = bookingsService;
        this.notificationsService = notificationsService;
        this.paystackSecret = configService.get('PAYSTACK_SECRET_KEY', '');
    }
    async initiatePaystackPayment(bookingId, email) {
        const booking = await this.bookingsService.findOne(bookingId);
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const amountKobo = Math.round(booking.totalAmount * 100);
        try {
            const { data } = await axios_1.default.post('https://api.paystack.co/transaction/initialize', {
                email,
                amount: amountKobo,
                currency: booking.currency === 'KES' ? 'KES' : 'USD',
                reference: booking.bookingNumber,
                callback_url: this.configService.get('PAYSTACK_CALLBACK_URL')
                    || `${this.configService.get('FRONTEND_URL')}/checkout/success`,
                metadata: {
                    origin_site: 'tembea_africa',
                    bookingId: bookingId,
                    bookingNumber: booking.bookingNumber,
                    custom_fields: [
                        { display_name: 'Booking Number', variable_name: 'booking_number', value: booking.bookingNumber },
                    ],
                },
            }, { headers: { Authorization: `Bearer ${this.paystackSecret}`, 'Content-Type': 'application/json' } });
            return { paymentUrl: data.data.authorization_url, reference: data.data.reference, provider: 'paystack' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.response?.data?.message || 'Failed to initialize Paystack payment');
        }
    }
    async verifyPaystackPayment(reference) {
        try {
            const { data } = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, { headers: { Authorization: `Bearer ${this.paystackSecret}` } });
            if (data.data.status !== 'success') {
                const pendingBooking = await this.bookingsService.findByNumber(reference).catch(() => null);
                if (pendingBooking) {
                    await this.notificationsService.sendBookingFailureEmail(pendingBooking.user.email, pendingBooking.user.firstName, pendingBooking.bookingNumber, pendingBooking.totalAmount).catch(() => null);
                }
                throw new common_1.BadRequestException('Payment not successful');
            }
            const booking = await this.bookingsService.findByNumber(reference);
            await this.bookingsService.confirm(booking._id.toString(), reference);
            return { success: true, booking, message: 'Payment verified and booking confirmed' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.response?.data?.message || 'Payment verification failed');
        }
    }
    async handleWebhook(provider, payload, signature, rawBody) {
        if (provider === 'paystack') {
            const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
            const body = rawBody && rawBody.length ? rawBody : JSON.stringify(payload);
            const hash = crypto.createHmac('sha512', this.paystackSecret).update(body).digest('hex');
            if (hash !== signature)
                throw new common_1.BadRequestException('Invalid webhook signature');
            const event = payload.event;
            const data = payload.data;
            if (event === 'charge.success') {
                const reference = data.reference;
                const booking = await this.bookingsService.findByNumber(reference).catch(() => null);
                if (booking)
                    await this.bookingsService.confirm(booking._id.toString(), reference);
            }
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        bookings_service_1.BookingsService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map