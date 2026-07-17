import { Document, Types } from 'mongoose';
export type BookingDocument = Booking & Document;
declare class BookingItem {
    type: string;
    itemId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    startDate: string;
    endDate?: string;
}
declare class GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    nationality?: string;
    specialRequests?: string;
}
export declare class Booking {
    bookingNumber: string;
    user: Types.ObjectId;
    items: BookingItem[];
    guestDetails: GuestDetails;
    subtotal: number;
    serviceFee: number;
    totalAmount: number;
    currency: string;
    status: string;
    paymentStatus: string;
    paymentMethod?: string;
    paymentReference?: string;
    paymentUrl?: string;
    startDate: string;
    endDate?: string;
    guests: number;
    cancellationReason?: string;
    cancelledAt?: Date;
    confirmedAt?: Date;
    isDeleted: boolean;
    commissionAmount: number;
    commissionRate: number;
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, Document<unknown, any, Booking, any, {}> & Booking & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Booking> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
