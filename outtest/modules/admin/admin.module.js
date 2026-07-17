"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const user_schema_1 = require("../users/schemas/user.schema");
const tour_schema_1 = require("../tours/schemas/tour.schema");
const booking_schema_1 = require("../bookings/schemas/booking.schema");
const review_schema_1 = require("../reviews/schemas/review.schema");
const destination_schema_1 = require("../destinations/schemas/destination.schema");
const accommodation_schema_1 = require("../accommodations/schemas/accommodation.schema");
const guide_schema_1 = require("../guides/schemas/guide.schema");
const transport_schema_1 = require("../transport/schemas/transport.schema");
const visit_schema_1 = require("./schemas/visit.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: tour_schema_1.Tour.name, schema: tour_schema_1.TourSchema },
                { name: booking_schema_1.Booking.name, schema: booking_schema_1.BookingSchema },
                { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
                { name: destination_schema_1.Destination.name, schema: destination_schema_1.DestinationSchema },
                { name: accommodation_schema_1.Accommodation.name, schema: accommodation_schema_1.AccommodationSchema },
                { name: guide_schema_1.Guide.name, schema: guide_schema_1.GuideSchema },
                { name: transport_schema_1.Transport.name, schema: transport_schema_1.TransportSchema },
                { name: visit_schema_1.Visit.name, schema: visit_schema_1.VisitSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map