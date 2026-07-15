import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery, isValidObjectId } from 'mongoose'
import { Accommodation, AccommodationDocument } from './schemas/accommodation.schema'

@Injectable()
export class AccommodationsService {
  constructor(@InjectModel(Accommodation.name) private accommodationModel: Model<AccommodationDocument>) {}

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 12, type, destination, minPrice, maxPrice, q, sort = 'rating' } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: FilterQuery<AccommodationDocument> = { status: 'active', isDeleted: false }
    if (type) filter.type = type
    if (destination) filter.destination = destination
    if (minPrice || maxPrice) filter.pricePerNight = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    }
    if (q) filter.$or = [
      { name: new RegExp(q as string, 'i') },
      { description: new RegExp(q as string, 'i') },
    ]
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      'price-asc': { pricePerNight: 1 },
      'price-desc': { pricePerNight: -1 },
    }
    const [data, total] = await Promise.all([
      this.accommodationModel.find(filter).sort(sortMap[sort as string] || { rating: -1 }).skip(skip).limit(limit as number)
        .populate('destination', 'name slug country')
        .lean(),
      this.accommodationModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async findFeatured() {
    const data = await this.accommodationModel.find({ featured: true, status: 'active', isDeleted: false })
      .sort({ rating: -1 }).limit(6)
      .populate('destination', 'name slug country')
      .lean()
    return { data }
  }

  async findBySlug(slug: string) {
    const query: FilterQuery<AccommodationDocument> = { isDeleted: false }
    const nameQuery = slug.replace(/-/g, ' ')
    if (isValidObjectId(slug)) {
      query.$or = [
        { _id: slug },
        { slug },
        { name: new RegExp('^' + nameQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    } else {
      query.$or = [
        { slug },
        { name: new RegExp('^' + nameQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    }

    const stay = await this.accommodationModel.findOne(query)
      .populate('destination', 'name slug country heroImage')
      .populate('owner', 'firstName lastName avatar email')
      .lean()
    if (!stay) throw new NotFoundException(`Accommodation '${slug}' not found`)
    return stay
  }

  async checkAvailability(id: string, checkIn: string, checkOut: string, guests: number) {
    const stay = await this.accommodationModel.findById(id)
    if (!stay) throw new NotFoundException('Accommodation not found')
    if (guests < 1) throw new BadRequestException('At least 1 guest required')
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    return { available: true, checkIn, checkOut, guests, nights, totalPrice: stay.pricePerNight * nights, accommodationId: id }
  }
}
