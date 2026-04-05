import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FlightJobs Backend API is running! 🚀';
  }

  getHealth(): object {
    return {
      status: 'ok',
      message: 'FlightJobs API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
