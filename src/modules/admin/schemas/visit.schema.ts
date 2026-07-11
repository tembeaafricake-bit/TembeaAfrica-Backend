import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose'
import { User } from '../../users/schemas/user.schema'

export type VisitDocument = Visit & Document

@Schema({ timestamps: true })
export class Visit {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  user?: User

  @Prop({ required: true })
  ip: string

  @Prop({ required: true })
  userAgent: string

  @Prop({ default: 'Unknown' })
  country: string

  @Prop({ default: '/' })
  pageUrl: string
}

export const VisitSchema = SchemaFactory.createForClass(Visit)
