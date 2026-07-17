import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export type ConversationDocument = Conversation & Document;
export declare class Message {
    conversationId: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    attachments: string[];
    readBy: Types.ObjectId[];
    isDeleted: boolean;
}
export declare class Conversation {
    participants: Types.ObjectId[];
    topic: string;
    relatedBooking?: Types.ObjectId;
    lastMessage?: Types.ObjectId;
    isDeleted: boolean;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const ConversationSchema: import("mongoose").Schema<Conversation, import("mongoose").Model<Conversation, any, any, any, Document<unknown, any, Conversation, any, {}> & Conversation & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, import("mongoose").FlatRecord<Conversation>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Conversation> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
