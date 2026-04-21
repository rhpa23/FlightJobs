import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class JobFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  icao?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  departure?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  arrival?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  airlineId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;
}
