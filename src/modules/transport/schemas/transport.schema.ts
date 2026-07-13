import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type TransportDocument = Transport & Document

@Schema({ timestamps: true, collection: 'transport' })
export class Transport {
  @Prop({ required: true })
  name: string

  @Prop({ sparse: true, unique: true })
  slug?: string

  @Prop({ enum: ['bus', 'car', 'flight', 'ferry'], required: true })
  type: string

  @Prop({ required: true })
  route: string

  @Prop({ required: true, min: 0 })
  price: number

  @Prop({ default: 'USD' })
  currency: string

  @Prop()
  duration: string

  @Prop({ default: 0 })
  rating: number

  @Prop({ default: 0 })
  reviewCount: number

  @Prop({ required: true })
  description: string

  @Prop()
  image?: string

  @Prop({ default: 'active', enum: ['active', 'inactive', 'draft', 'suspended'] })
  status: string

  @Prop({ default: false })
  isDeleted: boolean
}

export const TransportSchema = SchemaFactory.createForClass(Transport)
TransportSchema.index({ type: 1 })
TransportSchema.index({ route: 'text', name: 'text', description: 'text' })
TransportSchema.index({ price: 1 })
TransportSchema.index({ rating: -1 })
TransportSchema.index({ status: 1, isDeleted: 1 })
