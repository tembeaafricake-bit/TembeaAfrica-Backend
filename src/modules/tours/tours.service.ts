import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery, isValidObjectId } from 'mongoose'
import { Tour, TourDocument } from './schemas/tour.schema'
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema'

export interface ToursQuery {
  page?: number
  limit?: number
  destination?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  country?: string
  q?: string
  sort?: string
  featured?: boolean
  instantBooking?: boolean
}

@Injectable()
export class ToursService {
  constructor(
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
  ) {}

  private async resolveDestinationId(destination?: string) {
    if (!destination) return undefined

    const value = destination.toString().toLowerCase().trim()
    if (isValidObjectId(value)) return value

    const slug = value.replace(/\s+/g, '-')
    const destinationDoc = await this.destinationModel.findOne({
      isDeleted: { $ne: true },
      $or: [
        { _id: value },
        { slug: value },
        { slug },
        { name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
    }).select('_id').lean()

    return destinationDoc?._id
  }

  async findAll(query: ToursQuery) {
    const { page = 1, limit = 12, destination, category, minPrice, maxPrice, rating, q, sort = 'rating', featured, instantBooking } = query
    const skip = (page - 1) * limit
    const filter: FilterQuery<TourDocument> = { status: 'active', isDeleted: { $ne: true } }

    const destinationId = await this.resolveDestinationId(destination)
    if (destination && destinationId) {
      filter.destination = destinationId
    } else if (destination) {
      return { data: [], total: 0, page, limit, totalPages: 0 }
    }

    if (category) filter.category = category
    if (featured !== undefined) filter.featured = featured
    if (instantBooking !== undefined) filter.instantBooking = instantBooking
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) }
    if (rating) filter.rating = { $gte: Number(rating) }
    if (q) filter.$text = { $search: q }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      rating: { rating: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
      popular: { totalBookings: -1 },
    }
    const sortObj = sortMap[sort] || { rating: -1 }

    const buildToursQuery = () => this.tourModel.find(filter).sort(sortObj).skip(skip).limit(limit)
    const [data, total] = await Promise.all([
      buildToursQuery()
        .populate('destination', 'name slug country heroImage')
        .populate('operator', 'firstName lastName avatar')
        .lean()
        .catch(async (error) => {
          // A stale or malformed reference must not prevent visitors from
          // browsing every tour. Return the listing and let the client use
          // its existing safe fallbacks for unresolved relation fields.
          console.error('Unable to populate tour relations:', error)
          return buildToursQuery().lean()
        }),
      this.tourModel.countDocuments(filter),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findFeatured() {
    const filter = { featured: true, status: 'active', isDeleted: { $ne: true } }
    const buildFeaturedQuery = () => this.tourModel.find(filter).sort({ rating: -1 }).limit(9)
    const data = await buildFeaturedQuery()
      .populate('destination', 'name slug country heroImage')
      .populate('operator', 'firstName lastName avatar')
      .lean()
      .catch(async (error) => {
        console.error('Unable to populate featured tour relations:', error)
        return buildFeaturedQuery().lean()
      })
    return { data }
  }

  async findBySlug(slug: string) {
    const query: FilterQuery<TourDocument> = { isDeleted: { $ne: true } }
    const titleQuery = slug.replace(/-/g, ' ')
    if (isValidObjectId(slug)) {
      query.$or = [
        { _id: slug },
        { slug },
        { title: new RegExp('^' + titleQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    } else {
      query.$or = [
        { slug },
        { title: new RegExp('^' + titleQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      ]
    }
    const tour = await this.tourModel.findOne(query)
      .populate('destination', 'name slug country heroImage coordinates description')
      .populate('operator', 'firstName lastName avatar email phone')
      .lean()
    if (!tour) throw new NotFoundException(`Tour '${slug}' not found`)
    return tour
  }

  async findById(id: string) {
    const tour = await this.tourModel.findById(id).populate('destination operator').lean()
    if (!tour) throw new NotFoundException('Tour not found')
    return tour
  }

  async findByDestination(destinationId: string, limit = 6) {
    return this.tourModel.find({ destination: destinationId, status: 'active', isDeleted: { $ne: true } })
      .sort({ rating: -1 }).limit(limit)
      .populate('operator', 'firstName lastName avatar')
      .lean()
  }

  async checkAvailability(tourId: string, date: string, guests: number) {
    const tour = await this.tourModel.findById(tourId)
    if (!tour) throw new NotFoundException('Tour not found')
    if (guests > tour.groupSize) throw new BadRequestException(`Maximum group size is ${tour.groupSize}`)
    const isAvailable = tour.availability.length === 0 || tour.availability.includes(date)
    return { available: isAvailable, date, guests, price: tour.price * guests, tourId }
  }

  async create(data: Partial<Tour>) {
    const slug = this.generateSlug(data.title!)
    const tour = await this.tourModel.create({ ...data, slug })
    return tour
  }

  async update(id: string, data: Partial<Tour>) {
    const tour = await this.tourModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    if (!tour) throw new NotFoundException('Tour not found')
    return tour
  }

  async delete(id: string) {
    await this.tourModel.findByIdAndUpdate(id, { isDeleted: true })
    return { message: 'Tour deleted successfully' }
  }

  async updateRating(tourId: string, newRating: number, reviewCount: number) {
    await this.tourModel.findByIdAndUpdate(tourId, { rating: newRating, reviewCount })
  }

  async incrementBookings(tourId: string) {
    await this.tourModel.findByIdAndUpdate(tourId, { $inc: { totalBookings: 1 } })
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
  }
}
