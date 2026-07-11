import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/schemas/user.schema'
import { Tour, TourDocument } from '../tours/schemas/tour.schema'
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema'
import { Review, ReviewDocument } from '../reviews/schemas/review.schema'
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema'
import { Accommodation, AccommodationDocument } from '../accommodations/schemas/accommodation.schema'
import { Guide, GuideDocument } from '../guides/schemas/guide.schema'
import { generateSeedData } from '../../database/seed-data'

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tour.name) private tourModel: Model<TourDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Destination.name) private destinationModel: Model<DestinationDocument>,
    @InjectModel(Accommodation.name) private accommodationModel: Model<AccommodationDocument>,
    @InjectModel(Guide.name) private guideModel: Model<GuideDocument>,
  ) {}

  async getDashboardStats() {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalUsers, newUsersThisMonth, newUsersLastMonth,
      totalBookings, bookingsThisMonth, bookingsLastMonth,
      revenueResult, revenueLastMonthResult,
      totalTours, totalReviews, totalDestinations, totalGuides, totalAccommodations,
      bookingsByStatus, revenueByMonth,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.userModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      this.bookingModel.countDocuments({ isDeleted: false }),
      this.bookingModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.bookingModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, commission: { $sum: '$commissionAmount' } } }]),
      this.bookingModel.aggregate([{ $match: { paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      this.tourModel.countDocuments({ isDeleted: false }),
      this.reviewModel.countDocuments({ isDeleted: false }),
      this.destinationModel.countDocuments({ isDeleted: false }),
      this.guideModel.countDocuments({ isDeleted: false }),
      this.accommodationModel.countDocuments({ isDeleted: false }),
      this.bookingModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.bookingModel.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
        { $group: { _id: { month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $sort: { '_id.month': 1 } },
      ]),
    ])

    const revenue = revenueResult[0]?.total || 0
    const revenueLastMonth = revenueLastMonthResult[0]?.total || 0
    const revenueGrowth = revenueLastMonth > 0 ? ((revenue - revenueLastMonth) / revenueLastMonth) * 100 : 0

    return {
      users: { total: totalUsers, thisMonth: newUsersThisMonth, growth: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0 },
      bookings: { total: totalBookings, thisMonth: bookingsThisMonth, growth: bookingsLastMonth > 0 ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 : 0 },
      revenue: { thisMonth: revenue, commission: revenueResult[0]?.commission || 0, growth: revenueGrowth },
      listings: { tours: totalTours, reviews: totalReviews, destinations: totalDestinations, guides: totalGuides, accommodations: totalAccommodations },
      bookingsByStatus: Object.fromEntries(bookingsByStatus.map((b: any) => [b._id, b.count])),
      revenueByMonth,
    }
  }

  async getUsers(query: Record<string, unknown>) {
    const { page = 1, limit = 20, role, q, banned } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = {}
    if (role) filter.role = role
    if (banned !== undefined) filter.isBanned = banned === 'true'
    if (q) filter.$or = [
      { firstName: new RegExp(q as string, 'i') },
      { lastName: new RegExp(q as string, 'i') },
      { email: new RegExp(q as string, 'i') },
    ]
    const [data, total] = await Promise.all([
      this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit as number).lean(),
      this.userModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async banUser(id: string, banned: boolean) {
    return this.userModel.findByIdAndUpdate(id, { isBanned: banned }, { new: true }).select('-password')
  }

  async updateUserRole(id: string, role: string) {
    return this.userModel.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
  }

  async getBookings(query: Record<string, unknown>) {
    const { page = 1, limit = 20, status } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (status) filter.status = status
    const [data, total] = await Promise.all([
      this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email avatar').lean(),
      this.bookingModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async updateBookingStatus(id: string, status: string) {
    return this.bookingModel.findByIdAndUpdate(id, { status }, { new: true }).populate('user', 'firstName lastName email')
  }

  async getListings(type: string, query: Record<string, unknown>) {
    const { page = 1, limit = 20, q, status } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (status) filter.status = status
    if (q) {
      filter.$or = [
        { name: new RegExp(q as string, 'i') },
        { title: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
        { bio: new RegExp(q as string, 'i') },
        { category: new RegExp(q as string, 'i') },
      ]
    }

    let model: Model<any>
    let sort: Record<string, 1 | -1> = { createdAt: -1 }
    switch (type) {
      case 'destinations':
        model = this.destinationModel
        break
      case 'tours':
        model = this.tourModel
        break
      case 'guides':
        model = this.guideModel
        break
      case 'accommodations':
        model = this.accommodationModel
        break
      default:
        throw new BadRequestException('Invalid listing type')
    }

    const [data, total] = await Promise.all([
      model.find(filter).sort(sort).skip(skip).limit(limit as number).lean(),
      model.countDocuments(filter),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async createListing(type: string, data: Record<string, unknown>) {
    switch (type) {
      case 'destinations': {
        const slug = (data.slug as string) || this.generateSlug(data.name as string)
        return this.destinationModel.create({ ...data, slug, status: data.status || 'active' })
      }
      case 'tours': {
        const slug = (data.slug as string) || this.generateSlug(data.title as string)
        if (!data.destination) {
          const dest = await this.destinationModel.findOne({ isDeleted: false }).lean()
          if (dest) data.destination = dest._id
        }
        if (!data.operator) {
          const op = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean()
          if (op) data.operator = op._id
        }
        if (!data.images && data.heroImage) data.images = [data.heroImage as string]
        if (!data.images) data.images = ['https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600']
        return this.tourModel.create({ ...data, slug, status: data.status || 'active', instantBooking: data.instantBooking ?? true })
      }
      case 'guides': {
        if (!data.user) {
          const guideUser = await this.userModel.findOne({ role: 'guide' }).lean()
          if (guideUser) data.user = guideUser._id
        }
        if (!data.languages) data.languages = ['English', 'Swahili']
        return this.guideModel.create({ ...data, status: data.status || 'active' })
      }
      case 'accommodations': {
        const slug = (data.slug as string) || this.generateSlug(data.name as string)
        if (!data.destination) {
          const dest = await this.destinationModel.findOne({ isDeleted: false }).lean()
          if (dest) data.destination = dest._id
        }
        if (!data.owner) {
          const owner = await this.userModel.findOne({ role: { $in: ['operator', 'admin'] } }).lean()
          if (owner) data.owner = owner._id
        }
        if (!data.images && data.heroImage) data.images = [data.heroImage as string]
        if (!data.images) data.images = ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600']
        return this.accommodationModel.create({ ...data, slug, status: data.status || 'active' })
      }
      default:
        throw new BadRequestException('Invalid listing type')
    }
  }

  async deleteListing(type: string, id: string) {
    let model: Model<any>
    switch (type) {
      case 'destinations': model = this.destinationModel; break
      case 'tours': model = this.tourModel; break
      case 'guides': model = this.guideModel; break
      case 'accommodations': model = this.accommodationModel; break
      default: throw new BadRequestException('Invalid listing type')
    }
    const item = await model.findByIdAndUpdate(id, { isDeleted: true, status: 'inactive' }, { new: true })
    if (!item) throw new NotFoundException('Listing not found')
    return { message: 'Listing deleted successfully' }
  }

  async updateListingStatus(type: string, id: string, status: string) {
    let model: Model<any>
    switch (type) {
      case 'destinations':
        model = this.destinationModel
        break
      case 'tours':
        model = this.tourModel
        break
      case 'guides':
        model = this.guideModel
        break
      case 'accommodations':
        model = this.accommodationModel
        break
      default:
        throw new BadRequestException('Invalid listing type')
    }

    const item = await model.findByIdAndUpdate(id, { status }, { new: true })
    if (!item) throw new NotFoundException('Listing not found')
    return item
  }

  private generateSlug(value: string) {
    return `${(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`
  }

  async getReviews(query: Record<string, unknown>) {
    const { page = 1, limit = 20, approved } = query
    const skip = ((page as number) - 1) * (limit as number)
    const filter: Record<string, unknown> = { isDeleted: false }
    if (approved !== undefined) filter.approved = approved === 'true'
    const [data, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit as number)
        .populate('user', 'firstName lastName email').lean(),
      this.reviewModel.countDocuments(filter),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / (limit as number)) }
  }

  async approveReview(id: string) {
    return this.reviewModel.findByIdAndUpdate(id, { approved: true }, { new: true })
  }

  async deleteReview(id: string) {
    return this.reviewModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
  }

  /**
   * Seed database with initial test data.
   * Safe to call multiple times — skips if data already exists.
   * To add more seed data in the future:
   * 1. Update src/database/seed-data.ts with new collections
   * 2. Call this endpoint again
   */
  async seedDatabase() {
    try {
      // Check if already seeded — count users to detect existing data
      const userCount = await this.userModel.countDocuments()
      if (userCount > 0) {
        return {
          success: false,
          message: 'Database already seeded',
          details: `Found ${userCount} existing users. Skipping seed to avoid duplicates.`,
          tip: 'To re-seed, clear the database collections first.',
        }
      }

      console.log('🌱 Starting database seed...')

      // Get seed data
      const seedData = await generateSeedData()

      // ─── SEED COLLECTIONS ──────────────────────────────────────────────────
      const results: Record<string, number> = {}

      // Users
      if (seedData.collections.users?.length > 0) {
        const users = await this.userModel.insertMany(seedData.collections.users)
        results.users = users.length
        console.log(`✅ Seeded ${users.length} users`)
      }

      // Destinations
      if (seedData.collections.destinations?.length > 0) {
        const destinations = await this.destinationModel.insertMany(seedData.collections.destinations)
        results.destinations = destinations.length
        console.log(`✅ Seeded ${destinations.length} destinations`)
      }

      // Tours
      if (seedData.collections.tours?.length > 0) {
        const tours = await this.tourModel.insertMany(seedData.collections.tours)
        results.tours = tours.length
        console.log(`✅ Seeded ${tours.length} tours`)
      }

      // Guides
      if (seedData.collections.guides?.length > 0) {
        const guides = await this.guideModel.insertMany(seedData.collections.guides)
        results.guides = guides.length
        console.log(`✅ Seeded ${guides.length} guides`)
      }

      // Accommodations
      if (seedData.collections.accommodations?.length > 0) {
        const accommodations = await this.accommodationModel.insertMany(seedData.collections.accommodations)
        results.accommodations = accommodations.length
        console.log(`✅ Seeded ${accommodations.length} accommodations`)
      }

      // Reviews
      if (seedData.collections.reviews?.length > 0) {
        const reviews = await this.reviewModel.insertMany(seedData.collections.reviews)
        results.reviews = reviews.length
        console.log(`✅ Seeded ${reviews.length} reviews`)
      }

      console.log('\n🎉 Database seeded successfully!')

      return {
        success: true,
        message: '✅ Database seeded successfully!',
        details: results,
        loginCredentials: {
          admin: { email: 'tembeaafricake@gmail.com', password: 'Hamp9map....#' },
          guide: { email: 'joseph@tembeaafrica.com', password: 'Admin@123' },
          tourist: { email: 'john@example.com', password: 'Admin@123' },
          operator: { email: 'operator@marasafaris.com', password: 'Admin@123' },
        },
        nextSteps: [
          'Login with any of the provided credentials',
          'Explore destinations, tours, guides, and accommodations',
          'To add more seed data in future: update src/database/seed-data.ts and call this endpoint again',
        ],
      }
    } catch (error: any) {
      console.error('❌ Seed failed:', error.message)
      throw new BadRequestException({
        success: false,
        message: 'Database seeding failed',
        error: error.message,
        tip: 'Ensure MongoDB connection is active and collections are accessible.',
      })
    }
  }
}
