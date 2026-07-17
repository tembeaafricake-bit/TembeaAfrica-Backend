import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: {
        userId: string;
    }, body: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMyBookings(user: {
        userId: string;
    }): Promise<(import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string, user: {
        userId: string;
        role: string;
    }): Promise<import("mongoose").FlattenMaps<import("./schemas/booking.schema").BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancel(id: string, user: {
        userId: string;
    }, reason: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/booking.schema").BookingDocument, {}, {}> & import("./schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
