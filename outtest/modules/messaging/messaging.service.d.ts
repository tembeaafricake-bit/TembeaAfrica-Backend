import { Model } from 'mongoose';
import { Message, MessageDocument, Conversation, ConversationDocument } from './schemas/messaging.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagingService {
    private messageModel;
    private conversationModel;
    private notificationsService;
    constructor(messageModel: Model<MessageDocument>, conversationModel: Model<ConversationDocument>, notificationsService: NotificationsService);
    getConversations(userId: string): Promise<(import("mongoose").FlattenMaps<ConversationDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    startConversation(userId: string, topic: string, relatedBooking?: string): Promise<Omit<import("mongoose").Document<unknown, {}, ConversationDocument, {}, {}> & Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").FlattenMaps<MessageDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    sendMessage(conversationId: string, senderId: string, content: string, attachments?: string[]): Promise<Omit<import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    private sendEmailNotifications;
    getUnreadCount(userId: string): Promise<number>;
}
