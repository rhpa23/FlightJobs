import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'FlightJobs Backend API is running! 🚀';
  }
}
