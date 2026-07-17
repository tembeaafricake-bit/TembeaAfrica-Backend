import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Model } from 'mongoose';
import { Message, MessageDocument, ConversationDocument } from './schemas/messaging.schema';
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messageModel;
    private conversationModel;
    server: Server;
    private connectedUsers;
    constructor(messageModel: Model<MessageDocument>, conversationModel: Model<ConversationDocument>);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, data: {
        conversationId: string;
    }): {
        status: string;
        conversationId: string;
    };
    handleSendMessage(client: Socket, data: {
        conversationId: string;
        senderId: string;
        content: string;
        attachments?: string[];
    }): Promise<{
        status: string;
        message: Omit<import("mongoose").Document<unknown, {}, MessageDocument, {}, {}> & Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }, never>;
    }>;
    handleMarkRead(client: Socket, data: {
        conversationId: string;
        userId: string;
    }): Promise<{
        status: string;
    }>;
    handleTyping(client: Socket, data: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
    }): void;
    notifyUser(userId: string, event: string, data: unknown): void;
}
