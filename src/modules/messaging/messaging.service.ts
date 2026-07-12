import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Message, MessageDocument, Conversation, ConversationDocument } from './schemas/messaging.schema'
import { NotificationsService } from '../notifications/notifications.service'

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async getConversations(userId: string) {
    return this.conversationModel.find({ participants: userId, isDeleted: false })
      .sort({ updatedAt: -1 })
      .populate('participants', 'firstName lastName avatar role')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'firstName lastName' } })
      .lean()
  }

  async startConversation(userId: string, topic: string, relatedBooking?: string) {
    // Find admin/support user or create conversation with platform
    const conversation = await this.conversationModel.create({
      participants: [userId],
      topic,
      relatedBooking,
    })
    return conversation.populate('participants', 'firstName lastName avatar')
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conversation = await this.conversationModel.findById(conversationId)
    if (!conversation) throw new NotFoundException('Conversation not found')

    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.messageModel.find({ conversationId, isDeleted: false })
        .sort({ createdAt: -1 }).skip(skip).limit(limit)
        .populate('sender', 'firstName lastName avatar role').lean(),
      this.messageModel.countDocuments({ conversationId, isDeleted: false }),
    ])

    // Mark messages as read
    await this.messageModel.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    )

    return { data: data.reverse(), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async sendMessage(conversationId: string, senderId: string, content: string, attachments: string[] = []) {
    const message = await this.messageModel.create({ conversationId, sender: senderId, content, attachments })
    await this.conversationModel.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() })
    
    // Asynchronously send email receipts/notifications via Resend
    this.sendEmailNotifications(conversationId, senderId, content).catch(() => null)

    return message.populate('sender', 'firstName lastName avatar')
  }

  private async sendEmailNotifications(conversationId: string, senderId: string, content: string) {
    try {
      const conversation = await this.conversationModel.findById(conversationId)
        .populate('participants', 'firstName lastName email role')
      if (!conversation) return

      const participants = conversation.participants as any[]
      const sender = participants.find(p => p._id.toString() === senderId)
      const recipients = participants.filter(p => p._id.toString() !== senderId)

      // 1. Send copy receipt to the sender (customer)
      if (sender && sender.email) {
        await this.notificationsService.sendMessageReceipt(
          sender.email,
          sender.firstName,
          content,
        )
      }

      // 2. Send notification to all other participants
      const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Someone'
      for (const recipient of recipients) {
        if (recipient.email) {
          await this.notificationsService.sendMessageNotification(
            recipient.email,
            recipient.firstName,
            senderName,
            content,
          )
        }
      }
    } catch (err) {
      console.error('Failed to send email notifications for message:', err)
    }
  }

  async getUnreadCount(userId: string) {
    const conversations = await this.conversationModel.find({ participants: userId })
    const conversationIds = conversations.map(c => c._id)
    return this.messageModel.countDocuments({
      conversationId: { $in: conversationIds },
      readBy: { $ne: userId },
      sender: { $ne: userId },
    })
  }
}
