import { IsOptional, IsNumber, IsString, IsBoolean, IsDate, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChallengeDto {
  @ApiProperty({ description: 'Challenge title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Challenge description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Challenge type', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  type?: number;

  @ApiProperty({ description: 'Reward amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reward?: number;

  @ApiProperty({ description: 'Required pilot score', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  requiredScore?: number;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Expiration date', required: false })
  @IsOptional()
  @IsDate()
  expirationDate?: Date;

  @ApiProperty({ description: 'Departure airport ICAO code', required: false })
  @IsOptional()
  @IsString()
  departureICAO?: string;

  @ApiProperty({ description: 'Arrival airport ICAO code', required: false })
  @IsOptional()
  @IsString()
  arrivalICAO?: string;

  @ApiProperty({ description: 'Required aircraft model', required: false })
  @IsOptional()
  @IsString()
  requiredAircraft?: string;

  @ApiProperty({ description: 'Minimum distance', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minDistance?: number;

  @ApiProperty({ description: 'Maximum distance', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;
}
