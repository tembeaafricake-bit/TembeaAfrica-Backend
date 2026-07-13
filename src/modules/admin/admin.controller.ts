import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService, private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    })
  }

  @Post('upload-image')
  @ApiOperation({ summary: 'Upload an admin image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 },
    { name: 'heroImageFile', maxCount: 1 },
  ], { storage: memoryStorage() }))
  async uploadImage(@UploadedFiles() files: {
    image?: Express.Multer.File[]
    file?: Express.Multer.File[]
    heroImage?: Express.Multer.File[]
    heroImageFile?: Express.Multer.File[]
  }) {
    const uploadFile = files?.image?.[0] || files?.file?.[0] || files?.heroImage?.[0] || files?.heroImageFile?.[0]

    if (!uploadFile?.buffer?.length) {
      throw new BadRequestException('Image file is required')
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'tembea-africa/admin' }, (error, uploadResult) => {
        if (error) return reject(error)
        resolve(uploadResult)
      })
      Readable.from(uploadFile.buffer).pipe(uploadStream)
    })

    return { url: result.secure_url }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() { return this.adminService.getDashboardStats() }

  @Get('analytics')
  @ApiOperation({ summary: 'Get visitor analytics' })
  getAnalytics() { return this.adminService.getVisitorAnalytics() }

  @Post('seed')
  @ApiOperation({ summary: 'Seed database with initial test data (admin only, idempotent)' })
  seedDatabase() { return this.adminService.seedDatabase() }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  getUsers(@Query() query: Record<string, unknown>) { return this.adminService.getUsers(query) }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban or unban a user' })
  banUser(@Param('id') id: string, @Body('banned') banned: boolean) { return this.adminService.banUser(id, banned) }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  updateRole(@Param('id') id: string, @Body('role') role: string) { return this.adminService.updateUserRole(id, role) }

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings' })
  getBookings(@Query() query: Record<string, unknown>) { return this.adminService.getBookings(query) }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status' })
  updateBookingStatus(@Param('id') id: string, @Body('status') status: string) { return this.adminService.updateBookingStatus(id, status) }

  @Get('listings')
  @ApiOperation({ summary: 'List admin-managed listings' })
  getListings(@Query('type') type: string, @Query() query: Record<string, unknown>) {
    return this.adminService.getListings(type, query)
  }

  @Post('listings')
  @ApiOperation({ summary: 'Create a destination, tour, guide, or accommodation' })
  createListing(@Query('type') type: string, @Body() body: Record<string, unknown>) {
    return this.adminService.createListing(type, body)
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  getReviews(@Query() query: Record<string, unknown>) { return this.adminService.getReviews(query) }

  @Patch('reviews/:id/approve')
  @ApiOperation({ summary: 'Approve a review' })
  approveReview(@Param('id') id: string) { return this.adminService.approveReview(id) }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a review' })
  deleteReview(@Param('id') id: string) { return this.adminService.deleteReview(id) }

  @Delete(':type/:id')
  @ApiOperation({ summary: 'Soft-delete a listing' })
  deleteListing(@Param('type') type: string, @Param('id') id: string) {
    return this.adminService.deleteListing(type, id)
  }

  @Patch(':type/:id/status')
  @ApiOperation({ summary: 'Update listing status' })
  updateListingStatus(@Param('type') type: string, @Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateListingStatus(type, id, status)
  }
}
