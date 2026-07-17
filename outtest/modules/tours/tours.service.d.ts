import { Model } from 'mongoose';
import { Tour, TourDocument } from './schemas/tour.schema';
import { DestinationDocument } from '../destinations/schemas/destination.schema';
export interface ToursQuery {
    page?: number;
    limit?: number;
    destination?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    country?: string;
    q?: string;
    sort?: string;
    featured?: boolean;
    instantBooking?: boolean;
}
export declare class ToursService {
    private tourModel;
    private destinationModel;
    constructor(tourModel: Model<TourDocument>, destinationModel: Model<DestinationDocument>);
    private resolveDestinationId;
    findAll(query: ToursQuery): Promise<{
        data: (import("mongoose").FlattenMaps<TourDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findFeatured(): Promise<{
        data: (import("mongoose").FlattenMaps<TourDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findBySlug(slug: string): Promise<import("mongoose").FlattenMaps<TourDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<TourDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByDestination(destinationId: string, limit?: number): Promise<(import("mongoose").FlattenMaps<TourDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    checkAvailability(tourId: string, date: string, guests: number): Promise<{
        available: boolean;
        date: string;
        guests: number;
        price: number;
        tourId: string;
    }>;
    create(data: Partial<Tour>): Promise<import("mongoose").Document<unknown, {}, TourDocument, {}, {}> & Tour & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: Partial<Tour>): Promise<import("mongoose").Document<unknown, {}, TourDocument, {}, {}> & Tour & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    updateRating(tourId: string, newRating: number, reviewCount: number): Promise<void>;
    incrementBookings(tourId: string): Promise<void>;
    private generateSlug;
}
