import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePaystack(bookingId: string, user: {
        email: string;
    }): Promise<{
        paymentUrl: any;
        reference: any;
        provider: string;
    }>;
    verifyPaystack(reference: string): Promise<{
        success: boolean;
        booking: import("mongoose").FlattenMaps<import("../bookings/schemas/booking.schema").BookingDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        message: string;
    }>;
    webhook(provider: string, payload: Record<string, unknown>, signature: string, req: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
}
