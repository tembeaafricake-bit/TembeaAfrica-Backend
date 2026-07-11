import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { GuidesService } from './guides.service'

@ApiTags('guides')
@Controller('guides')
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'List all guides with filters' })
  findAll(@Query() query: Record<string, unknown>) { return this.guidesService.findAll(query) }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured guides' })
  getFeatured() { return this.guidesService.findFeatured() }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guide by ID' })
  findOne(@Param('id') id: string) { return this.guidesService.findById(id) }

  @Post(':id/check-availability')
  @ApiOperation({ summary: 'Check guide availability' })
  checkAvailability(@Param('id') id: string, @Body() body: { date: string }) {
    return this.guidesService.checkAvailability(id, body.date)
  }
}
