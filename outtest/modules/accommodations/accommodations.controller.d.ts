import { AccommodationsService } from './accommodations.service';
export declare class AccommodationsController {
    private accommodationsService;
    constructor(accommodationsService: AccommodationsService);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/accommodation.schema").AccommodationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    getFeatured(): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/accommodation.schema").AccommodationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findOne(slug: string): Promise<import("mongoose").FlattenMaps<import("./schemas/accommodation.schema").AccommodationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    checkAvailability(id: string, body: {
        checkIn: string;
        checkOut: string;
        guests: number;
    }): Promise<{
        available: boolean;
        checkIn: string;
        checkOut: string;
        guests: number;
        nights: number;
        totalPrice: number;
        accommodationId: string;
    }>;
}
