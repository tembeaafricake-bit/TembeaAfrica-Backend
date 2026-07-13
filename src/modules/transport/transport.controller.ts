import { Controller, Get, Query, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TransportService } from './transport.service'

@ApiTags('transport')
@Controller('transport')
export class TransportController {
  constructor(private transportService: TransportService) {}

  @Get()
  @ApiOperation({ summary: 'Get transport listings' })
  getAll(@Query() query: Record<string, unknown>) {
    return this.transportService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one transport listing' })
  getOne(@Param('id') id: string) {
    return this.transportService.findOne(id)
  }
}
