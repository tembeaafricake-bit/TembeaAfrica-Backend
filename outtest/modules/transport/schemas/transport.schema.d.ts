import { Document } from 'mongoose';
export type TransportDocument = Transport & Document;
export declare class Transport {
    name: string;
    slug?: string;
    type: string;
    route: string;
    price: number;
    currency: string;
    duration: string;
    rating: number;
    reviewCount: number;
    description: string;
    image?: string;
    status: string;
    isDeleted: boolean;
}
export declare const TransportSchema: import("mongoose").Schema<Transport, import("mongoose").Model<Transport, any, any, any, Document<unknown, any, Transport, any, {}> & Transport & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Transport, Document<unknown, {}, import("mongoose").FlatRecord<Transport>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Transport> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
