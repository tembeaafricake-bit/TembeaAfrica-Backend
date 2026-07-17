"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const messaging_gateway_1 = require("./messaging.gateway");
const messaging_controller_1 = require("./messaging.controller");
const messaging_service_1 = require("./messaging.service");
const messaging_schema_1 = require("./schemas/messaging.schema");
const notifications_module_1 = require("../notifications/notifications.module");
let MessagingModule = class MessagingModule {
};
exports.MessagingModule = MessagingModule;
exports.MessagingModule = MessagingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: messaging_schema_1.Message.name, schema: messaging_schema_1.MessageSchema },
                { name: messaging_schema_1.Conversation.name, schema: messaging_schema_1.ConversationSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [messaging_controller_1.MessagingController],
        providers: [messaging_gateway_1.MessagingGateway, messaging_service_1.MessagingService],
        exports: [messaging_service_1.MessagingService, messaging_gateway_1.MessagingGateway],
    })
], MessagingModule);
//# sourceMappingURL=messaging.module.js.map