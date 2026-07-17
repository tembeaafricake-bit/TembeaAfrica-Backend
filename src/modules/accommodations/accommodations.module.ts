import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Accommodation, AccommodationSchema } from './schemas/accommodation.schema'
import { Destination, DestinationSchema } from '../destinations/schemas/destination.schema'
import { User, UserSchema } from '../users/schemas/user.schema'
import { AccommodationsController } from './accommodations.controller'
import { AccommodationsService } from './accommodations.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: Destination.name, schema: DestinationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
  exports: [AccommodationsService, MongooseModule],
})
export class AccommodationsModule {}
