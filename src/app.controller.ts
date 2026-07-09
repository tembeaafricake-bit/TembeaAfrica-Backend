import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: '🚀 Tembea Africa API is running',
      version: '1.0.0',
      description: "Africa's leading travel marketplace backend",
      documentation: '/api/docs',
      status: 'operational',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
  }
}
