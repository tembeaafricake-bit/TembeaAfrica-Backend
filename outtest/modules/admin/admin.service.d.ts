import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tour, TourDocument } from '../tours/schemas/tour.schema';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { Destination, DestinationDocument } from '../destinations/schemas/destination.schema';
import { Accommodation, AccommodationDocument } from '../accommodations/schemas/accommodation.schema';
import { Guide, GuideDocument } from '../guides/schemas/guide.schema';
import { Transport, TransportDocument } from '../transport/schemas/transport.schema';
import { VisitDocument } from './schemas/visit.schema';
export declare class AdminService {
    private userModel;
    private tourModel;
    private bookingModel;
    private reviewModel;
    private destinationModel;
    private accommodationModel;
    private guideModel;
    private transportModel;
    private visitModel;
    constructor(userModel: Model<UserDocument>, tourModel: Model<TourDocument>, bookingModel: Model<BookingDocument>, reviewModel: Model<ReviewDocument>, destinationModel: Model<DestinationDocument>, accommodationModel: Model<AccommodationDocument>, guideModel: Model<GuideDocument>, transportModel: Model<TransportDocument>, visitModel: Model<VisitDocument>);
    getDashboardStats(): Promise<{
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
    getVisitorAnalytics(): Promise<{
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
        recentVisits: (import("mongoose").FlattenMaps<VisitDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getUsers(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<UserDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    banUser(id: string, banned: boolean): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateUserRole(id: string, role: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getBookings(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<BookingDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    updateBookingStatus(id: string, status: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
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
    private resolveDestinationId;
    private resolveUserId;
    private ensureFallbackDestination;
    private resolveOrCreateDestinationId;
    private buildSlug;
    private ensureUniqueSlug;
    createListing(type: string, data: Record<string, unknown>): Promise<(import("mongoose").Document<unknown, {}, DestinationDocument, {}, {}> & Destination & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, AccommodationDocument, {}, {}> & Accommodation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, TourDocument, {}, {}> & Tour & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, GuideDocument, {}, {}> & Guide & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | (import("mongoose").Document<unknown, {}, TransportDocument, {}, {}> & Transport & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })>;
    deleteListing(type: string, id: string): Promise<{
        message: string;
    }>;
    updateListing(type: string, id: string, data: Record<string, unknown>): Promise<any>;
    updateListingStatus(type: string, id: string, status: string): Promise<any>;
    private generateSlug;
    getReviews(query: Record<string, unknown>): Promise<{
        data: (import("mongoose").FlattenMaps<ReviewDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: unknown;
        limit: unknown;
        totalPages: number;
    }>;
    approveReview(id: string): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteReview(id: string): Promise<import("mongoose").Document<unknown, {}, ReviewDocument, {}, {}> & Review & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
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
}
