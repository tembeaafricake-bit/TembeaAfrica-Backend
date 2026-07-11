import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery } from 'mongoose'
import { Guide, GuideDocument } from './schemas/guide.schema'

@Injectable()
export class GuidesService {
  constructor(@InjectModel(Guide.name) private guideModel: Model<GuideDocument>) {}

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, category, q, verified, sort = 'rating' } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: FilterQuery<GuideDocument> = { status: 'active', isDeleted: false }
    if (category) filter.category = category
    if (verified !== undefined) filter.verified = verified === 'true' || verified === true
    if (q) filter.$or = [
      { bio: new RegExp(q as string, 'i') },
      { specializations: new RegExp(q as string, 'i') },
    ]
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      'rate-asc': { dailyRate: 1 },
      experience: { experience: -1 },
    }
    const [data, total] = await Promise.all([
      this.guideModel.find(filter).sort(sortMap[sort as string] || { rating: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName avatar email')
        .populate('primaryDestination', 'name slug country')
        .lean(),
      this.guideModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async findFeatured() {
    const data = await this.guideModel.find({ status: 'active', isDeleted: false, verified: true })
      .sort({ rating: -1 }).limit(8)
      .populate('user', 'firstName lastName avatar')
      .lean()
    return { data }
  }

  async findById(id: string) {
    const guide = await this.guideModel.findOne({ _id: id, isDeleted: false })
      .populate('user', 'firstName lastName avatar email phone')
      .populate('primaryDestination', 'name slug country heroImage')
      .lean()
    if (!guide) throw new NotFoundException('Guide not found')
    return guide
  }

  async checkAvailability(guideId: string, date: string) {
    const guide = await this.guideModel.findById(guideId)
    if (!guide) throw new NotFoundException('Guide not found')
    const isAvailable = guide.availability.length === 0 || guide.availability.includes(date)
    return { available: isAvailable, date, dailyRate: guide.dailyRate, guideId }
  }
}
