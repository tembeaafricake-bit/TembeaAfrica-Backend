import { Model } from 'mongoose';
import { GuideDocument } from './schemas/guide.schema';
export declare class GuidesService {
    private guideModel;
    constructor(guideModel: Model<GuideDocument>);
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<GuideDocument> & Required<{
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
        data: (import("mongoose").FlattenMaps<GuideDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<GuideDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    checkAvailability(guideId: string, date: string): Promise<{
        available: boolean;
        date: string;
        dailyRate: number;
        guideId: string;
    }>;
}
