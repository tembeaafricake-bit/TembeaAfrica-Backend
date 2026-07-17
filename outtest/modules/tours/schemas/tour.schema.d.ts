import { Document, Types } from 'mongoose';
export type TourDocument = Tour & Document;
declare class ItineraryDay {
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation?: string;
}
declare class PricingTier {
    minGuests: number;
    maxGuests: number;
    pricePerPerson: number;
}
export declare class Tour {
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    destination: Types.ObjectId;
    operator: Types.ObjectId;
    category: string;
    images: string[];
    videoUrl?: string;
    price: number;
    pricingTiers?: PricingTier[];
    currency: string;
    duration: string;
    groupSize: number;
    minAge?: number;
    rating: number;
    reviewCount: number;
    featured: boolean;
    instantBooking: boolean;
    itinerary: ItineraryDay[];
    includes: string[];
    excludes: string[];
    highlights: string[];
    tags: string[];
    availability: string[];
    cancellationPolicy?: string;
    status: string;
    totalBookings: number;
    isDeleted: boolean;
}
export declare const TourSchema: import("mongoose").Schema<Tour, import("mongoose").Model<Tour, any, any, any, Document<unknown, any, Tour, any, {}> & Tour & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tour, Document<unknown, {}, import("mongoose").FlatRecord<Tour>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Tour> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
