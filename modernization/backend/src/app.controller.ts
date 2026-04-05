import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Status' })
  getHello(): string {
    return 'FlightJobs Backend API is running! 🚀';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  getHealth(): object {
    return {
      status: 'ok',
      message: 'FlightJobs API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
