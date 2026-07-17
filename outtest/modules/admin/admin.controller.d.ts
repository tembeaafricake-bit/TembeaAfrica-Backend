import { ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    private configService;
    constructor(adminService: AdminService, configService: ConfigService);
    uploadImage(files: {
        image?: Express.Multer.File[];
        file?: Express.Multer.File[];
        heroImage?: Express.Multer.File[];
        heroImageFile?: Express.Multer.File[];
    }): Promise<{
        url: string;
    }>;
    getStats(): Promise<{
        users: {
            total: number;
            thisMonth: number;
            growth: number;
        };
        bookings: {
            total: number;
            thisMonth: number;
            growth: number;
        };
        revenue: {
            thisMonth: any;
            commission: any;
            growth: number;
        };
        listings: {
            tours: number;
            reviews: number;
            destinations: number;
            guides: number;
            accommodations: number;
            transport: number;
        };
        bookingsByStatus: any;
        revenueByMonth: any[];
    }>;
    getAnalytics(): Promise<{
        totalVisits: number;
        authenticatedVisits: number;
        anonymousVisits: number;
        uniqueCountries: number;
        countriesBreakdown: any[];
        pagesBreakdown: any[];
        last24Hours: {
            total: number;
            authenticated: number;
            anonymous: number;
            topPages: any[];
        };
        recentVisits: (import("mongoose").FlattenMaps<import("./schemas/visit.schema").VisitDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    seedDatabase(): Promise<{
        success: boolean;
        message: string;
        details: string;
        tip: string;
        loginCredentials?: undefined;
        nextSteps?: undefined;
    } | {
        success: boolean;
        message: string;
        details: Record<string, number>;
        loginCredentials: {
            admin: {
                email: string;
                password: string;
            };
            guide: {
                email: string;
                password: string;
            };
            tourist: {
                email: string;
                password: string;
            };
            operator: {
                email: string;
                password: string;
            };
        };
        nextSteps: string[];
        tip?: undefined;
    }>;
    getUsers(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("../users/schemas/user.schema").UserDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    banUser(id: string, banned: boolean): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument, {}, {}> & import("../users/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRole(id: string, role: string): Promise<import("mongoose").Document<unknown, {}, import("../users/schemas/user.schema").UserDocument, {}, {}> & import("../users/schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getBookings(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("../bookings/schemas/booking.schema").BookingDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    updateBookingStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, import("../bookings/schemas/booking.schema").BookingDocument, {}, {}> & import("../bookings/schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getListings(type: string, query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<any> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    createListing(type: string, body: Record<string, unknown>): Promise<(import("mongoose").Document<unknown, {}, import("../destinations/schemas/destination.schema").DestinationDocument, {}, {}> & import("../destinations/schemas/destination.schema").Destination & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, import("../accommodations/schemas/accommodation.schema").AccommodationDocument, {}, {}> & import("../accommodations/schemas/accommodation.schema").Accommodation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, import("../tours/schemas/tour.schema").TourDocument, {}, {}> & import("../tours/schemas/tour.schema").Tour & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, import("../guides/schemas/guide.schema").GuideDocument, {}, {}> & import("../guides/schemas/guide.schema").Guide & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, import("../transport/schemas/transport.schema").TransportDocument, {}, {}> & import("../transport/schemas/transport.schema").Transport & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })>;
    updateListing(type: string, id: string, body: Record<string, unknown>): Promise<any>;
    getReviews(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<import("../reviews/schemas/review.schema").ReviewDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    approveReview(id: string): Promise<import("mongoose").Document<unknown, {}, import("../reviews/schemas/review.schema").ReviewDocument, {}, {}> & import("../reviews/schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteReview(id: string): Promise<import("mongoose").Document<unknown, {}, import("../reviews/schemas/review.schema").ReviewDocument, {}, {}> & import("../reviews/schemas/review.schema").Review & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteListing(type: string, id: string): Promise<{
        message: string;
    }>;
    updateListingStatus(type: string, id: string, status: string): Promise<any>;
}
