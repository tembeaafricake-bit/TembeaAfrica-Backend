import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TransportController } from './transport.controller'
import { TransportService } from './transport.service'
import { Transport, TransportSchema } from './schemas/transport.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: Transport.name, schema: TransportSchema }])],
  controllers: [TransportController],
  providers: [TransportService],
})
export class TransportModule {}
