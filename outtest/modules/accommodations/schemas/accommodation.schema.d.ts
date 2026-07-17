import { Document, Types } from 'mongoose';
export type AccommodationDocument = Accommodation & Document;
declare class Room {
    name: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    images: string[];
    amenities: string[];
}
export declare class Accommodation {
    name: string;
    slug: string;
    type: string;
    destination: Types.ObjectId;
    owner: Types.ObjectId;
    description: string;
    images: string[];
    pricePerNight: number;
    currency: string;
    rating: number;
    reviewCount: number;
    amenities: string[];
    rooms: Room[];
    coordinates: {
        lat: number;
        lng: number;
    };
    featured: boolean;
    status: string;
    isDeleted: boolean;
}
export declare const AccommodationSchema: import("mongoose").Schema<Accommodation, import("mongoose").Model<Accommodation, any, any, any, Document<unknown, any, Accommodation, any, {}> & Accommodation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Accommodation, Document<unknown, {}, import("mongoose").FlatRecord<Accommodation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Accommodation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
