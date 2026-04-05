import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteJobDto {
  @ApiProperty()
  @IsNumber()
  flightTime: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  startFuelWeight?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  finishFuelWeight?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  usedFuelWeight?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  modelName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  modelDescription?: string;
}
