import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class BookingsService {
    private bookingModel;
    private notificationsService;
    private eventEmitter;
    constructor(bookingModel: Model<BookingDocument>, notificationsService: NotificationsService, eventEmitter: EventEmitter2);
    create(userId: string, data: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findMyBookings(userId: string): Promise<(import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string, userId?: string): Promise<import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByNumber(bookingNumber: string): Promise<import("mongoose").FlattenMaps<BookingDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancel(id: string, userId: string, reason?: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    confirm(id: string, paymentReference: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    complete(id: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<BookingDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    getStats(): Promise<{
        totalRevenue: any;
        totalCommission: any;
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
    }>;
    getMonthlyRevenue(): Promise<any[]>;
}
