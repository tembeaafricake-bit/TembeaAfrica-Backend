import { TransportService } from './transport.service';
export declare class TransportController {
    private transportService;
    constructor(transportService: TransportService);
    getAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/transport.schema").TransportDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    getOne(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/transport.schema").TransportDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
