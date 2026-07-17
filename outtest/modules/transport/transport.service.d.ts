import { Model } from 'mongoose';
import { TransportDocument } from './schemas/transport.schema';
export declare class TransportService {
    private transportModel;
    constructor(transportModel: Model<TransportDocument>);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<TransportDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<TransportDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
