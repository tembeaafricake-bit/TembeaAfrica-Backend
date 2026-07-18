import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery, isValidObjectId } from 'mongoose'
import { Accommodation, AccommodationDocument } from './schemas/accommodation.schema'
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema'

@Injectable()
export class AccommodationsService {
  private readonly logger = new Logger(AccommodationsService.name)
  constructor(
    @InjectModel(Accommodation.name) private accommodationModel: Model<AccommodationDocument>,
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

  private async normalizeAccommodationDestinations(listings: any[]) {
    if (!Array.isArray(listings) || listings.length === 0) return listings

    const destinationValues = Array.from(new Set(
      listings
        .map((item: any) => item.destination)
        .filter((destination): destination is string => typeof destination === 'string' && destination.trim() !== ''),
    ))

    if (destinationValues.length === 0) return listings

    const validDestinationIds = destinationValues.filter((destination) => isValidObjectId(destination))
    const invalidDestinationKeys = destinationValues.filter((destination) => !isValidObjectId(destination))

    const destinationFilter: FilterQuery<DestinationDocument> = { $or: [] }
    if (validDestinationIds.length > 0) destinationFilter.$or.push({ _id: { $in: validDestinationIds } })
    if (invalidDestinationKeys.length > 0) {
      destinationFilter.$or.push({ slug: { $in: invalidDestinationKeys } })
      destinationFilter.$or.push({ name: { $in: invalidDestinationKeys } })
    }

    const destinations = destinationFilter.$or.length > 0
      ? await this.destinationModel.find(destinationFilter).select('name slug country heroImage').lean()
      : []

    const destinationsById = new Map(destinations.map((dest: any) => [dest._id.toString(), dest]))
    const destinationsBySlug = new Map(destinations.map((dest: any) => [dest.slug, dest]))
    const destinationsByName = new Map(destinations.map((dest: any) => [dest.name, dest]))

    return listings.map((item: any) => {
      if (item.destination && typeof item.destination === 'string') {
        return {
          ...item,
          destination: destinationsById.get(item.destination)
            || destinationsBySlug.get(item.destination)
            || destinationsByName.get(item.destination)
            || item.destination,
        }
      }
      return item
    })
  }

  async findAll(query: Record<string, unknown>) {
    try {
      const { page = 1, limit = 12, type, destination, minPrice, maxPrice, q, sort = 'rating' } = query
      const skip = ((page as number) - 1) * (limit as number)
      const filter: FilterQuery<AccommodationDocument> = { status: 'active', isDeleted: { $ne: true } }
      if (type) filter.type = type
      const destinationId = await this.resolveDestinationId(destination as string)
      if (destination && destinationId) {
        filter.destination = destinationId
      } else if (destination) {
        return { data: [], total: 0, page, limit, totalPages: 0 }
      }
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
      const buildAccommodationsQuery = () => this.accommodationModel
        .find(filter)
        .sort(sortMap[sort as string] || { rating: -1 })
        .skip(skip)
        .limit(limit as number)
      const rawData = await buildAccommodationsQuery().lean()
      const total = await this.accommodationModel.countDocuments(filter)
      const data = await this.normalizeAccommodationDestinations(rawData)
      return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
    } catch (error) {
      this.logger.error('Failed to fetch accommodations', error as Error)
      throw error
    }
  }

  async findFeatured() {
    const query = this.accommodationModel.find({ featured: true, status: 'active', isDeleted: { $ne: true } })
      .sort({ rating: -1 }).limit(6)
      .populate('destination', 'name slug country')

    const data = await query.lean().catch(async (error) => {
      this.logger.warn('Unable to populate featured accommodation destinations; returning base listings.', error)
      return this.accommodationModel.find({ featured: true, status: 'active', isDeleted: { $ne: true } })
        .sort({ rating: -1 }).limit(6).lean()
    })

    const normalized = await this.normalizeAccommodationDestinations(data)
    return { data: normalized }
  }

  async findBySlug(slug: string) {
    const query: FilterQuery<AccommodationDocument> = { isDeleted: { $ne: true } }
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
      .catch(async (error) => {
        this.logger.warn('Unable to populate accommodation details; returning base stay.', error)
        return this.accommodationModel.findOne(query).lean()
      })

    if (!stay) throw new NotFoundException(`Accommodation '${slug}' not found`)
    const [normalized] = await this.normalizeAccommodationDestinations([stay])
    return normalized
  }

  async checkAvailability(id: string, checkIn: string, checkOut: string, guests: number) {
    const stay = await this.accommodationModel.findById(id)
    if (!stay) throw new NotFoundException('Accommodation not found')
    if (guests < 1) throw new BadRequestException('At least 1 guest required')
    const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    return { available: true, checkIn, checkOut, guests, nights, totalPrice: stay.pricePerNight * nights, accommodationId: id }
  }
}
