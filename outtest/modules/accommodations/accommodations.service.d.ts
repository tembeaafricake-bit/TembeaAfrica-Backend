import { Model } from 'mongoose';
import { AccommodationDocument } from './schemas/accommodation.schema';
import { DestinationDocument } from '../destinations/schemas/destination.schema';
export declare class AccommodationsService {
    private accommodationModel;
    private destinationModel;
    constructor(accommodationModel: Model<AccommodationDocument>, destinationModel: Model<DestinationDocument>);
    private resolveDestinationId;
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<AccommodationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    findFeatured(): Promise<{
        data: (import("mongoose").FlattenMaps<AccommodationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findBySlug(slug: string): Promise<import("mongoose").FlattenMaps<AccommodationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    checkAvailability(id: string, checkIn: string, checkOut: string, guests: number): Promise<{
        available: boolean;
        checkIn: string;
        checkOut: string;
        guests: number;
        nights: number;
        totalPrice: number;
        accommodationId: string;
    }>;
}
