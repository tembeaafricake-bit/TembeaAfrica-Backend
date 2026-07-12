import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessagingGateway } from './messaging.gateway'
import { MessagingController } from './messaging.controller'
import { MessagingService } from './messaging.service'
import { Message, MessageSchema, Conversation, ConversationSchema } from './schemas/messaging.schema'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingGateway, MessagingService],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
