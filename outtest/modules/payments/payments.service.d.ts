import { ConfigService } from '@nestjs/config';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PaymentsService {
    private configService;
    private bookingsService;
    private notificationsService;
    private paystackSecret;
    constructor(configService: ConfigService, bookingsService: BookingsService, notificationsService: NotificationsService);
    initiatePaystackPayment(bookingId: string, email: string): Promise<{
        paymentUrl: any;
        reference: any;
        provider: string;
    }>;
    verifyPaystackPayment(reference: string): Promise<{
        success: boolean;
        booking: import("mongoose").FlattenMaps<import("../bookings/schemas/booking.schema").BookingDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
    }>;
    handleWebhook(provider: string, payload: Record<string, unknown>, signature: string, rawBody?: string): Promise<{
        received: boolean;
    }>;
}
