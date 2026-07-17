import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
export type VisitDocument = Visit & Document;
export declare class Visit {
    user?: User;
    ip: string;
    userAgent: string;
    country: string;
    pageUrl: string;
}
export declare const VisitSchema: MongooseSchema<Visit, import("mongoose").Model<Visit, any, any, any, Document<unknown, any, Visit, any, {}> & Visit & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Visit, Document<unknown, {}, import("mongoose").FlatRecord<Visit>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Visit> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
