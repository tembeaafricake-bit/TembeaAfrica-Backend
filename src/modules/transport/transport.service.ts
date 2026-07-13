import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Transport, TransportDocument } from './schemas/transport.schema'

@Injectable()
export class TransportService {
  constructor(@InjectModel(Transport.name) private transportModel: Model<TransportDocument>) {}

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, q, status, type } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (status) filter.status = status
    if (type) filter.type = type
    if (q) {
      filter.$or = [
        { name: new RegExp(q as string, 'i') },
        { route: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
      ]
    }

    const [data, total] = await Promise.all([
      this.transportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number).lean(),
      this.transportModel.countDocuments(filter),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async findOne(id: string) {
    const transport = await this.transportModel.findOne({
      $or: [{ _id: id }, { slug: id }, { name: id }],
      isDeleted: false,
    }).lean()
    if (!transport) {
      throw new NotFoundException('Transport listing not found')
    }
    return transport
  }
}
