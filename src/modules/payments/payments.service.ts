import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import { BookingsService } from '../bookings/bookings.service'

@Injectable()
export class PaymentsService {
  private paystackSecret: string

  constructor(
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    this.paystackSecret = configService.get('PAYSTACK_SECRET_KEY', '')
  }

  async initiatePaystackPayment(bookingId: string, email: string) {
    const booking = await this.bookingsService.findOne(bookingId)
    if (!booking) throw new NotFoundException('Booking not found')

    const amountKobo = Math.round(booking.totalAmount * 100) // Paystack uses kobo

    try {
      const { data } = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amountKobo,
          currency: booking.currency === 'KES' ? 'KES' : 'USD',
          reference: booking.bookingNumber,
          callback_url: this.configService.get('PAYSTACK_CALLBACK_URL')
            || `${this.configService.get('FRONTEND_URL')}/checkout/success`,
          metadata: {
            origin_site: 'tembea_africa',
            bookingId: bookingId,
            bookingNumber: booking.bookingNumber,
            custom_fields: [
              { display_name: 'Booking Number', variable_name: 'booking_number', value: booking.bookingNumber },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${this.paystackSecret}`, 'Content-Type': 'application/json' } },
      )
      return { paymentUrl: data.data.authorization_url, reference: data.data.reference, provider: 'paystack' }
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to initialize Paystack payment')
    }
  }

  async verifyPaystackPayment(reference: string) {
    try {
      const { data } = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${this.paystackSecret}` } },
      )

      if (data.data.status !== 'success') {
        const pendingBooking = await this.bookingsService.findByNumber(reference).catch(() => null)
        if (pendingBooking) {
          await this.notificationsService.sendBookingFailureEmail(
            (pendingBooking.user as any).email,
            (pendingBooking.user as any).firstName,
            pendingBooking.bookingNumber,
            pendingBooking.totalAmount,
          ).catch(() => null)
        }
        throw new BadRequestException('Payment not successful')
      }

      const booking = await this.bookingsService.findByNumber(reference)
      await this.bookingsService.confirm(booking._id.toString(), reference)
      return { success: true, booking, message: 'Payment verified and booking confirmed' }
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Payment verification failed')
    }
  }

  async handleWebhook(provider: string, payload: Record<string, unknown>, signature: string, rawBody?: string) {
    if (provider === 'paystack') {
      // Verify Paystack webhook signature using the raw request body when available.
      const crypto = await import('crypto')
      const body = rawBody && rawBody.length ? rawBody : JSON.stringify(payload)
      const hash = crypto.createHmac('sha512', this.paystackSecret).update(body).digest('hex')
      if (hash !== signature) throw new BadRequestException('Invalid webhook signature')

      const event = payload.event as string
      const data = payload.data as Record<string, unknown>

      if (event === 'charge.success') {
        const reference = data.reference as string
        const booking = await this.bookingsService.findByNumber(reference).catch(() => null)
        if (booking) await this.bookingsService.confirm(booking._id.toString(), reference)
      }
    }
    return { received: true }
  }
}
