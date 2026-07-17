import { ToursService } from './tours.service';
export declare class ToursController {
    private toursService;
    constructor(toursService: ToursService);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/tour.schema").TourDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFeatured(): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/tour.schema").TourDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getByDestination(id: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/tour.schema").TourDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(slug: string): Promise<import("mongoose").FlattenMaps<import("./schemas/tour.schema").TourDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    checkAvailability(id: string, body: {
        date: string;
        guests: number;
    }): Promise<{
        available: boolean;
        date: string;
        guests: number;
        price: number;
        tourId: string;
    }>;
    create(body: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/tour.schema").TourDocument, {}, {}> & import("./schemas/tour.schema").Tour & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/tour.schema").TourDocument, {}, {}> & import("./schemas/tour.schema").Tour & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
