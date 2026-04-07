import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartJobDto {
  @ApiProperty({ description: 'Latitude da posição atual da aeronave' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude da posição atual da aeronave' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Payload em quilogramas (kg)' })
  @IsNumber()
  payloadKilograms: number;

  @ApiProperty({ description: 'Peso do combustível em quilogramas (kg)' })
  @IsNumber()
  fuelWeightKilograms: number;
}
