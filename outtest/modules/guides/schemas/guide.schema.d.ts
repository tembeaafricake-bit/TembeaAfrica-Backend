import { Document, Types } from 'mongoose';
export type GuideDocument = Guide & Document;
export declare class Guide {
    user: Types.ObjectId;
    bio: string;
    languages: string[];
    certifications: string[];
    specializations: string[];
    experience: number;
    hourlyRate: number;
    dailyRate: number;
    rating: number;
    reviewCount: number;
    portfolio: string[];
    avatar: string;
    availability: string[];
    category: string;
    verified: boolean;
    status: string;
    isDeleted: boolean;
    primaryDestination?: Types.ObjectId;
}
export declare const GuideSchema: import("mongoose").Schema<Guide, import("mongoose").Model<Guide, any, any, any, Document<unknown, any, Guide, any, {}> & Guide & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Guide, Document<unknown, {}, import("mongoose").FlatRecord<Guide>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Guide> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
