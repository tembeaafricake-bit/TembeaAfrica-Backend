import { GuidesService } from './guides.service';
export declare class GuidesController {
    private guidesService;
    constructor(guidesService: GuidesService);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/guide.schema").GuideDocument> & Required<{
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
        data: (import("mongoose").FlattenMaps<import("./schemas/guide.schema").GuideDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findOne(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/guide.schema").GuideDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    checkAvailability(id: string, body: {
        date: string;
    }): Promise<{
        available: boolean;
        date: string;
        dailyRate: number;
        guideId: string;
    }>;
}
