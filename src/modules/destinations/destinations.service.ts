import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, FilterQuery, isValidObjectId } from 'mongoose'
import { Destination, DestinationDocument } from './schemas/destination.schema'
import { Tour, TourDocument } from '../tours/schemas/tour.schema'

@Injectable()
export class DestinationsService {
  constructor(
    @InjectModel(Destination.name) private destModel: Model<DestinationDocument>,
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
  ) {}

  private async attachTourCount(dest: any) {
    if (!dest) return dest
    const nameRegex = dest.name ? new RegExp(dest.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '.*'), 'i') : null
    const slugRegex = dest.slug ? new RegExp(dest.slug.replace(/[-_]/g, '.*'), 'i') : null
    
    // Also check if destination name contains tour destination string or vice versa
    const count = await this.tourModel.countDocuments({
      status: 'active',
      isDeleted: { $ne: true },
      $or: [
        { destination: dest._id },
        { destination: String(dest._id) },
        ...(dest.slug ? [{ destination: dest.slug }, { destination: slugRegex }] : []),
        ...(dest.name ? [{ destination: dest.name }, { destination: nameRegex }] : []),
      ],
    })

    return { ...dest, tourCount: count || dest.tourCount || 0 }
  }

  async findAll(query: Record<string, unknown>) {
    const { page = 1, limit = 20, country, q, sort = 'rating' } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: FilterQuery<DestinationDocument> = { status: { $ne: 'inactive' }, isDeleted: { $ne: true } }
    if (country) {
      filter.country = new RegExp(`^${country}$`, 'i')
    }
    if (q) filter.$text = { $search: q as string }
    const sortMap: Record<string, Record<string, 1 | -1>> = { rating: { rating: -1 }, name: { name: 1 }, newest: { createdAt: -1 } }
    const [rawDocs, total] = await Promise.all([
      this.destModel.find(filter).sort(sortMap[sort as string] || { rating: -1 }).skip(skip).limit(limit as number).lean(),
      this.destModel.countDocuments(filter),
    ])

    const data = await Promise.all(rawDocs.map(d => this.attachTourCount(d)))
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async findFeatured() {
    const rawDocs = await this.destModel.find({ featured: true, status: { $ne: 'inactive' }, isDeleted: { $ne: true } }).sort({ rating: -1 }).limit(8).lean()
    const data = await Promise.all(rawDocs.map(d => this.attachTourCount(d)))
    return { data }
  }

  async findBySlug(slug: string) {
    const query: FilterQuery<DestinationDocument> = { isDeleted: { $ne: true } }
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
    const dest = await this.destModel.findOne(query).lean()
    if (!dest) throw new NotFoundException(`Destination '${slug}' not found`)
    return this.attachTourCount(dest)
  }

  async findByCountry(country: string) {
    return this.destModel.find({ country: new RegExp(`^${country}$`, 'i'), status: { $ne: 'inactive' }, isDeleted: { $ne: true } }).sort({ featured: -1, rating: -1 }).lean()
  }

  async create(data: Partial<Destination>) {
    const slug = (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return this.destModel.create({ ...data, slug })
  }

  async update(id: string, data: Partial<Destination>) {
    const dest = await this.destModel.findByIdAndUpdate(id, data, { new: true })
    if (!dest) throw new NotFoundException('Destination not found')
    return dest
  }
}
