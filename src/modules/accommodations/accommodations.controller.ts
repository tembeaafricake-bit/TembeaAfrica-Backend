import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AccommodationsService } from './accommodations.service'

@ApiTags('accommodations')
@Controller('accommodations')
export class AccommodationsController {
  constructor(private accommodationsService: AccommodationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accommodations with filters' })
  findAll(@Query() query: Record<string, unknown>) { return this.accommodationsService.findAll(query) }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured accommodations' })
  getFeatured() { return this.accommodationsService.findFeatured() }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an accommodation by slug' })
  findOne(@Param('slug') slug: string) { return this.accommodationsService.findBySlug(slug) }

  @Post(':id/check-availability')
  @ApiOperation({ summary: 'Check accommodation availability' })
  checkAvailability(@Param('id') id: string, @Body() body: { checkIn: string; checkOut: string; guests: number }) {
    return this.accommodationsService.checkAvailability(id, body.checkIn, body.checkOut, body.guests)
  }
}
