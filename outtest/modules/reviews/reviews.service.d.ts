import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
export declare class ReviewsService {
    private reviewModel;
    constructor(reviewModel: Model<ReviewDocument>);
    create(userId: string, data: {
        targetType: string;
        targetId: string;
        rating: number;
        title: string;
        body: string;
        images?: string[];
    }): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findForTarget(targetType: string, targetId: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<ReviewDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        avgRating: any;
    }>;
    update(id: string, userId: string, data: Partial<Review>): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, userId: string, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    findAll(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<ReviewDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    approve(id: string): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private recalculateRating;
}
