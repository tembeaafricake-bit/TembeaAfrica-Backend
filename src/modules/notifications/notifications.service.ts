import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private resendApiKey: string
  private fromEmail: string

  constructor(private configService: ConfigService) {
    this.resendApiKey = configService.get('RESEND_API_KEY', '')
    this.fromEmail = configService.get('FROM_EMAIL', 'noreply@tembeaafrica.com')
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.resendApiKey) {
      this.logger.warn('RESEND_API_KEY not set — email not sent')
      return
    }
    try {
      const { data } = await axios.post(
        'https://api.resend.com/emails',
        { from: `Tembea Africa <${this.fromEmail}>`, to, subject, html },
        { headers: { Authorization: `Bearer ${this.resendApiKey}`, 'Content-Type': 'application/json' } },
      )
      this.logger.log(`Email sent to ${to}: ${data.id}`)
      return data
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${to}`, err.response?.data)
    }
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    return this.sendEmail(email, 'Welcome to Tembea Africa! 🦁', `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px;text-align:center;">
          <h1 style="color:#fff;font-size:28px;margin:0;">Welcome to Tembea Africa</h1>
          <p style="color:rgba(255,255,255,0.8);margin:10px 0 0;">Discover. Book. Explore Africa.</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1B4332;">Hello ${firstName}! 👋</h2>
          <p style="color:#666;line-height:1.6;">Thank you for joining Tembea Africa — your gateway to the most incredible travel experiences across Kenya and Tanzania.</p>
          <p style="color:#666;line-height:1.6;">You now have access to:</p>
          <ul style="color:#666;line-height:2;">
            <li>🦁 2,400+ verified safari and tour listings</li>
            <li>🏨 Top-rated hotels, lodges, and BnBs</li>
            <li>👤 340+ certified local guides</li>
            <li>🤖 AI-powered itinerary planner</li>
          </ul>
          <a href="${this.configService.get('FRONTEND_URL')}/destinations" style="display:inline-block;background:#1B4332;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Explore destinations →</a>
        </div>
        <div style="background:#f9f9f9;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
          <p><a href="${this.configService.get('FRONTEND_URL')}/unsubscribe" style="color:#999;">Unsubscribe</a></p>
        </div>
      </div>
    `)
  }

  async sendBookingPendingEmail(email: string, firstName: string, bookingNumber: string, amount: number) {
    return this.sendEmail(email, `Booking Pending Payment — ${bookingNumber}`, `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px;text-align:center;">
          <div style="font-size:48px;">⏳</div>
          <h1 style="color:#fff;margin:10px 0 0;">Booking Pending</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1B4332;">Hi ${firstName},</h2>
          <p style="color:#666;line-height:1.6;">Your booking <strong>${bookingNumber}</strong> has been created, but payment has not yet completed.</p>
          <p style="color:#666;line-height:1.6;">Please complete your payment to confirm your booking.</p>
          <div style="background:#f0faf4;border:1px solid #bee3cc;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#1B4332;font-family:monospace;">${bookingNumber}</p>
          </div>
          <p style="color:#666;"><strong>Total due:</strong> KSh ${amount.toLocaleString()}</p>
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display:inline-block;background:#1B4332;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Complete payment →</a>
        </div>
        <div style="background:#f9f9f9;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Questions? Contact us at support@tembeaafrica.com</p>
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
        </div>
      </div>
    `)
  }

  async sendBookingConfirmation(email: string, firstName: string, bookingNumber: string, amount: number) {
    return this.sendEmail(email, `Booking Confirmed — ${bookingNumber}`, `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:40px;text-align:center;">
          <div style="font-size:48px;">✅</div>
          <h1 style="color:#fff;margin:10px 0 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1B4332;">Great news, ${firstName}!</h2>
          <p style="color:#666;line-height:1.6;">Your African adventure is booked and confirmed. Get ready for an unforgettable experience!</p>
          <div style="background:#f0faf4;border:1px solid #bee3cc;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#1B4332;font-family:monospace;">${bookingNumber}</p>
          </div>
          <p style="color:#666;"><strong>Total paid:</strong> KSh ${amount.toLocaleString()}</p>
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display:inline-block;background:#1B4332;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">View my booking →</a>
        </div>
        <div style="background:#f9f9f9;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Questions? Contact us at support@tembeaafrica.com</p>
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
        </div>
      </div>
    `)
  }

  async sendBookingFailureEmail(email: string, firstName: string, bookingNumber: string, amount: number) {
    return this.sendEmail(email, `Payment Failed — ${bookingNumber}`, `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#B02A37,#EF4444);padding:40px;text-align:center;">
          <div style="font-size:48px;">⚠️</div>
          <h1 style="color:#fff;margin:10px 0 0;">Payment Failed</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#B02A37;">Hi ${firstName},</h2>
          <p style="color:#666;line-height:1.6;">We were unable to process payment for your booking <strong>${bookingNumber}</strong>.</p>
          <p style="color:#666;line-height:1.6;">Your booking is still pending payment. Please try again from your dashboard.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#9f1239;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booking Reference</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#B02A37;font-family:monospace;">${bookingNumber}</p>
          </div>
          <p style="color:#666;"><strong>Total due:</strong> KSh ${amount.toLocaleString()}</p>
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display:inline-block;background:#B02A37;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Retry payment →</a>
        </div>
        <div style="background:#f9f9f9;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Need help? Contact support@tembeaafrica.com</p>
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
        </div>
      </div>
    `)
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
    return this.sendEmail(email, 'Reset your Tembea Africa password', `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#1B4332;padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Password Reset</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1B4332;">Hi ${firstName},</h2>
          <p style="color:#666;line-height:1.6;">We received a request to reset your password. Click the button below to create a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#1B4332;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Reset my password →</a>
          <p style="color:#999;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `)
  }

  async sendCancellationEmail(email: string, firstName: string, bookingNumber: string) {
    return this.sendEmail(email, `Booking Cancelled — ${bookingNumber}`, `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1B4332;padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;">Booking Cancelled</h1>
        </div>
        <div style="padding:40px;">
          <p style="color:#666;">Hi ${firstName}, your booking <strong>${bookingNumber}</strong> has been cancelled. If you paid, your refund will be processed within 5–10 business days.</p>
          <a href="${this.configService.get('FRONTEND_URL')}/tours" style="display:inline-block;background:#1B4332;color:#fff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:20px;">Book another trip →</a>
        </div>
      </div>
    `)
  }

  async sendMessageReceipt(email: string, firstName: string, messageContent: string) {
    const previewContent = messageContent.length > 100 ? `${messageContent.substring(0, 100)}...` : messageContent;
    return this.sendEmail(email, 'We received your message! 🐾', `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:24px;margin:0;">Message Received</h1>
          <p style="color:rgba(255,255,255,0.8);margin:5px 0 0;">Tembea Africa Support</p>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#1B4332;margin-top:0;">Hello ${firstName},</h2>
          <p style="color:#666;line-height:1.6;">We have successfully received your message. One of our support representatives or local guides will get back to you shortly.</p>
          
          <div style="background:#f9f9f9;border-left:4px solid #2D6A4F;padding:15px;margin:20px 0;font-style:italic;color:#555;border-radius:0 8px 8px 0;">
            "${previewContent}"
          </div>

          <p style="color:#666;line-height:1.6;">You can view and reply to your conversation directly in your dashboard:</p>
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display:inline-block;background:#1B4332;color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:10px;">Go to Dashboard →</a>
        </div>
        <div style="background:#f4f4f4;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
        </div>
      </div>
    `)
  }

  async sendMessageNotification(email: string, firstName: string, senderName: string, messageContent: string) {
    const previewContent = messageContent.length > 100 ? `${messageContent.substring(0, 100)}...` : messageContent;
    return this.sendEmail(email, `New message from ${senderName} ✉️`, `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:24px;margin:0;">New Message</h1>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#1B4332;margin-top:0;">Hi ${firstName},</h2>
          <p style="color:#666;line-height:1.6;">You have received a new message from <strong>${senderName}</strong> on Tembea Africa:</p>
          
          <div style="background:#f9f9f9;border-left:4px solid #2D6A4F;padding:15px;margin:20px 0;color:#555;border-radius:0 8px 8px 0;">
            "${previewContent}"
          </div>

          <p style="color:#666;line-height:1.6;">Click the button below to view the message and reply:</p>
          <a href="${this.configService.get('FRONTEND_URL')}/dashboard" style="display:inline-block;background:#1B4332;color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;margin-top:10px;">Reply to message →</a>
        </div>
        <div style="background:#f4f4f4;padding:20px;text-align:center;color:#999;font-size:12px;">
          <p>Tembea Africa Ltd · Nairobi, Kenya</p>
        </div>
      </div>
    `)
  }
}
