import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false })

  app.use(express.json({
    verify: (req, _res, buf) => {
      ;(req as any).rawBody = buf.toString()
    },
  }))

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com", "validator.swagger.io"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
        },
      },
    })
  )
  app.use(cookieParser())
  app.use(compression())
  app.use(morgan('combined'))

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://tembeaafrica.com',
      'https://www.tembeaafrica.com',
      'https://api.tembeaafrica.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }))

  // Swagger API docs
  const config = new DocumentBuilder()
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
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = Number(process.env.PORT || 3001)
  const host = process.env.HOST || '0.0.0.0'
  await app.listen(port, host)
  console.log(`🌍 Tembea Africa API running on: http://${host}:${port}/api`)
  console.log(`📚 Swagger docs at: http://${host}:${port}/api/docs`)
  console.log(`💡 To seed database via API: POST http://${host}:${port}/api/admin/seed (requires admin auth)\n`)
}
bootstrap()
