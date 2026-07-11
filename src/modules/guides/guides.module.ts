import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Guide, GuideSchema } from './schemas/guide.schema'
import { GuidesController } from './guides.controller'
import { GuidesService } from './guides.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Guide.name, schema: GuideSchema }])],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService, MongooseModule],
})
export class GuidesModule {}
