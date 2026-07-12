import { Controller, Post, Get, Body, Param, Query, UseGuards, Headers, RawBodyRequest, Req } from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('paystack/initialize/:bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialize Paystack payment for a booking' })
  initiatePaystack(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: { email: string },
  ) {
    return this.paymentsService.initiatePaystackPayment(bookingId, user.email)
  }

  @Get('paystack/verify/:reference')
  @ApiOperation({ summary: 'Verify Paystack payment' })
  verifyPaystack(@Param('reference') reference: string) {
    return this.paymentsService.verifyPaystackPayment(reference)
  }


  @Post('webhook/:provider')
  @ApiOperation({ summary: 'Payment webhook handler (Paystack)' })
  webhook(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(provider, payload, signature, (req as any).rawBody)
  }
}
