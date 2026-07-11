import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Accommodation, AccommodationSchema } from './schemas/accommodation.schema'
import { AccommodationsController } from './accommodations.controller'
import { AccommodationsService } from './accommodations.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Accommodation.name, schema: AccommodationSchema }])],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
  exports: [AccommodationsService, MongooseModule],
})
export class AccommodationsModule {}
