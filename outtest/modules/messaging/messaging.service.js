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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const messaging_schema_1 = require("./schemas/messaging.schema");
const notifications_service_1 = require("../notifications/notifications.service");
let MessagingService = class MessagingService {
    constructor(messageModel, conversationModel, notificationsService) {
        this.messageModel = messageModel;
        this.conversationModel = conversationModel;
        this.notificationsService = notificationsService;
    }
    async getConversations(userId) {
        return this.conversationModel.find({ participants: userId, isDeleted: false })
            .sort({ updatedAt: -1 })
            .populate('participants', 'firstName lastName avatar role')
            .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'firstName lastName' } })
            .lean();
    }
    async startConversation(userId, topic, relatedBooking) {
        const conversation = await this.conversationModel.create({
            participants: [userId],
            topic,
            relatedBooking,
        });
        return conversation.populate('participants', 'firstName lastName avatar');
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.messageModel.find({ conversationId, isDeleted: false })
                .sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('sender', 'firstName lastName avatar role').lean(),
            this.messageModel.countDocuments({ conversationId, isDeleted: false }),
        ]);
        await this.messageModel.updateMany({ conversationId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
        return { data: data.reverse(), total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async sendMessage(conversationId, senderId, content, attachments = []) {
        const message = await this.messageModel.create({ conversationId, sender: senderId, content, attachments });
        await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() });
        this.sendEmailNotifications(conversationId, senderId, content).catch(() => null);
        return message.populate('sender', 'firstName lastName avatar');
    }
    async sendEmailNotifications(conversationId, senderId, content) {
        try {
            const conversation = await this.conversationModel.findById(conversationId)
                .populate('participants', 'firstName lastName email role');
            if (!conversation)
                return;
            const participants = conversation.participants;
            const sender = participants.find(p => p._id.toString() === senderId);
            const recipients = participants.filter(p => p._id.toString() !== senderId);
            if (sender && sender.email) {
                await this.notificationsService.sendMessageReceipt(sender.email, sender.firstName, content);
            }
            const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Someone';
            for (const recipient of recipients) {
                if (recipient.email) {
                    await this.notificationsService.sendMessageNotification(recipient.email, recipient.firstName, senderName, content);
                }
            }
        }
        catch (err) {
            console.error('Failed to send email notifications for message:', err);
        }
    }
    async getUnreadCount(userId) {
        const conversations = await this.conversationModel.find({ participants: userId });
        const conversationIds = conversations.map(c => c._id);
        return this.messageModel.countDocuments({
            conversationId: { $in: conversationIds },
            readBy: { $ne: userId },
            sender: { $ne: userId },
        });
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(messaging_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(messaging_schema_1.Conversation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map