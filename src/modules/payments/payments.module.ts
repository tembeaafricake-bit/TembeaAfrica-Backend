import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { BookingsModule } from '../bookings/bookings.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [BookingsModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
