import { Model } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';
export declare class DestinationsService {
    private destModel;
    constructor(destModel: Model<DestinationDocument>);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<DestinationDocument> & Required<{
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
        data: (import("mongoose").FlattenMaps<DestinationDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findBySlug(slug: string): Promise<import("mongoose").FlattenMaps<DestinationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findByCountry(country: string): Promise<(import("mongoose").FlattenMaps<DestinationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    create(data: Partial<Destination>): Promise<import("mongoose").Document<unknown, {}, DestinationDocument, {}, {}> & Destination & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: Partial<Destination>): Promise<import("mongoose").Document<unknown, {}, DestinationDocument, {}, {}> & Destination & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
