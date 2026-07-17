import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private configService;
    private readonly logger;
    private resendApiKey;
    private fromEmail;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, html: string): Promise<any>;
    sendWelcomeEmail(email: string, firstName: string): Promise<any>;
    sendBookingPendingEmail(email: string, firstName: string, bookingNumber: string, amount: number): Promise<any>;
    sendBookingConfirmation(email: string, firstName: string, bookingNumber: string, amount: number): Promise<any>;
    sendBookingFailureEmail(email: string, firstName: string, bookingNumber: string, amount: number): Promise<any>;
    sendPasswordResetEmail(email: string, firstName: string, resetUrl: string): Promise<any>;
    sendCancellationEmail(email: string, firstName: string, bookingNumber: string): Promise<any>;
    sendMessageReceipt(email: string, firstName: string, messageContent: string): Promise<any>;
    sendMessageNotification(email: string, firstName: string, senderName: string, messageContent: string): Promise<any>;
}
