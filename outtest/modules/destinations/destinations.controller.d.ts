import { DestinationsService } from './destinations.service';
export declare class DestinationsController {
    private destinationsService;
    constructor(destinationsService: DestinationsService);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/destination.schema").DestinationDocument> & Required<{
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
        data: (import("mongoose").FlattenMaps<import("./schemas/destination.schema").DestinationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getByCountry(country: string): Promise<(import("mongoose").FlattenMaps<import("./schemas/destination.schema").DestinationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(slug: string): Promise<import("mongoose").FlattenMaps<import("./schemas/destination.schema").DestinationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(body: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/destination.schema").DestinationDocument, {}, {}> & import("./schemas/destination.schema").Destination & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, body: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("./schemas/destination.schema").DestinationDocument, {}, {}> & import("./schemas/destination.schema").Destination & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
