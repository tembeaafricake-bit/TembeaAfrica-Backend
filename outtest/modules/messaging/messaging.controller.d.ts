import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private messagingService;
    constructor(messagingService: MessagingService);
    getConversations(user: {
        userId: string;
    }): Promise<(import("mongoose").FlattenMaps<import("./schemas/messaging.schema").ConversationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    startConversation(user: {
        userId: string;
    }, topic: string, relatedBooking?: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/messaging.schema").ConversationDocument, {}, {}> & import("./schemas/messaging.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getMessages(id: string, user: {
        userId: string;
    }, page?: number): Promise<{
        data: (import("mongoose").FlattenMaps<import("./schemas/messaging.schema").MessageDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    sendMessage(id: string, user: {
        userId: string;
    }, content: string, attachments?: string[]): Promise<Omit<import("mongoose").Document<unknown, {}, import("./schemas/messaging.schema").MessageDocument, {}, {}> & import("./schemas/messaging.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getUnreadCount(user: {
        userId: string;
    }): Promise<number>;
}
