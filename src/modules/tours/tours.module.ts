import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Tour, TourSchema } from './schemas/tour.schema'
import { Destination, DestinationSchema } from '../destinations/schemas/destination.schema'
import { ToursController } from './tours.controller'
import { ToursService } from './tours.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tour.name, schema: TourSchema },
      { name: Destination.name, schema: DestinationSchema },
    ]),
  ],
  controllers: [ToursController],
  providers: [ToursService],
  exports: [ToursService],
})
export class ToursModule {}
