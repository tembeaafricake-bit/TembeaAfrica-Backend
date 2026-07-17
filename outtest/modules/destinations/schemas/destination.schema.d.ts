import { Document } from 'mongoose';
export type DestinationDocument = Destination & Document;
declare class Coordinates {
    lat: number;
    lng: number;
}
export declare class Destination {
    name: string;
    slug: string;
    country: string;
    county?: string;
    description: string;
    shortDescription?: string;
    heroImage: string;
    images: string[];
    coordinates: Coordinates;
    rating: number;
    reviewCount: number;
    tourCount: number;
    hotelCount: number;
    tags: string[];
    bestTimeToVisit?: string;
    featured: boolean;
    status: string;
    isDeleted: boolean;
    travelTips?: string;
    visaInfo?: string;
}
export declare const DestinationSchema: import("mongoose").Schema<Destination, import("mongoose").Model<Destination, any, any, any, Document<unknown, any, Destination, any, {}> & Destination & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Destination, Document<unknown, {}, import("mongoose").FlatRecord<Destination>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Destination> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export {};
