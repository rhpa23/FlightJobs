import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineCertificate } from './entities/airline-certificate.entity';
import { AirlineFbo } from './entities/airline-fbo.entity';
import { AirlinesService } from './airlines.service';
import { AirlinesController } from './airlines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Airline, AirlineCertificate, AirlineFbo])],
  providers: [AirlinesService],
  controllers: [AirlinesController],
  exports: [AirlinesService, TypeOrmModule],
})
export class AirlinesModule {}
