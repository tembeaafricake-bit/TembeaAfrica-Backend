"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const messaging_schema_1 = require("./schemas/messaging.schema");
let MessagingGateway = class MessagingGateway {
    constructor(messageModel, conversationModel) {
        this.messageModel = messageModel;
        this.conversationModel = conversationModel;
        this.connectedUsers = new Map();
    }
    handleConnection(client) {
        const userId = client.handshake.auth?.userId;
        if (userId) {
            this.connectedUsers.set(userId, client.id);
            client.join(`user:${userId}`);
            console.log(`User ${userId} connected to chat`);
        }
    }
    handleDisconnect(client) {
        this.connectedUsers.forEach((socketId, userId) => {
            if (socketId === client.id)
                this.connectedUsers.delete(userId);
        });
    }
    handleJoinConversation(client, data) {
        client.join(`conversation:${data.conversationId}`);
        return { status: 'joined', conversationId: data.conversationId };
    }
    async handleSendMessage(client, data) {
        const message = await this.messageModel.create({
            conversationId: data.conversationId,
            sender: data.senderId,
            content: data.content,
            attachments: data.attachments || [],
        });
        await this.conversationModel.findByIdAndUpdate(data.conversationId, { lastMessage: message._id });
        const populated = await message.populate('sender', 'firstName lastName avatar');
        this.server.to(`conversation:${data.conversationId}`).emit('new_message', populated);
        return { status: 'sent', message: populated };
    }
    async handleMarkRead(client, data) {
        await this.messageModel.updateMany({ conversationId: data.conversationId, readBy: { $ne: data.userId } }, { $addToSet: { readBy: data.userId } });
        this.server.to(`conversation:${data.conversationId}`).emit('messages_read', { conversationId: data.conversationId, userId: data.userId });
        return { status: 'marked_read' };
    }
    handleTyping(client, data) {
        client.to(`conversation:${data.conversationId}`).emit('user_typing', data);
    }
    notifyUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleTyping", null);
exports.MessagingGateway = MessagingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/chat' }),
    __param(0, (0, mongoose_1.InjectModel)(messaging_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(messaging_schema_1.Conversation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map