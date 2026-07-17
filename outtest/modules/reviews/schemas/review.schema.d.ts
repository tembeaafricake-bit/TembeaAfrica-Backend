import { Document, Types } from 'mongoose';
export type ReviewDocument = Review & Document;
export declare class Review {
    user: Types.ObjectId;
    targetType: string;
    targetId: string;
    rating: number;
    title: string;
    body: string;
    images: string[];
    verified: boolean;
    approved: boolean;
    isDeleted: boolean;
}
export declare const ReviewSchema: import("mongoose").Schema<Review, import("mongoose").Model<Review, any, any, any, Document<unknown, any, Review, any, {}> & Review & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Review, Document<unknown, {}, import("mongoose").FlatRecord<Review>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Review> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
