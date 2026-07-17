"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    app.use(express_1.default.json({
        verify: (req, _res, buf) => {
            ;
            req.rawBody = buf.toString();
        },
    }));
    app.use((0, helmet_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, morgan_1.default)('combined'));
    app.enableCors({
        origin: [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'https://tembeaafrica.com',
            'https://www.tembeaafrica.com',
            'https://api.tembeaafrica.com',
            'http://localhost:3000',
            'http://localhost:3001',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Tembea Africa API')
        .setDescription("Africa's leading travel marketplace REST API")
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('destinations', 'Travel destinations')
        .addTag('tours', 'Tours and safaris')
        .addTag('accommodations', 'Hotels, BnBs, lodges')
        .addTag('guides', 'Local guide marketplace')
        .addTag('transport', 'Transportation services')
        .addTag('bookings', 'Booking management')
        .addTag('payments', 'Payment processing')
        .addTag('reviews', 'Reviews and ratings')
        .addTag('messaging', 'Real-time messaging')
        .addTag('ai-planner', 'AI itinerary generation')
        .addTag('admin', 'Admin panel')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🌍 Tembea Africa API running on: http://localhost:${port}/api`);
    console.log(`📚 Swagger docs at: http://localhost:${port}/api/docs`);
    console.log(`💡 To seed database via API: POST http://localhost:${port}/api/admin/seed (requires admin auth)\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map