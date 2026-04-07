import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FinishJobDto {
  @ApiProperty({ description: 'Latitude da posição atual da aeronave (aeroporto de chegada)' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude da posição atual da aeronave (aeroporto de chegada)' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Payload em quilogramas (kg)' })
  @IsNumber()
  payloadKilograms: number;

  @ApiProperty({ description: 'Peso do combustível restante em quilogramas (kg)' })
  @IsNumber()
  fuelWeightKilograms: number;

  @ApiProperty({ description: 'Número de registro da aeronave (tail number)', required: false })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ description: 'Descrição do modelo da aeronave', required: false })
  @IsOptional()
  @IsString()
  modelDescription?: string;

  @ApiProperty({ description: 'Mensagens de resultado do voo', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resultMessages?: string[];

  @ApiProperty({ description: 'Pontuação de resultado do voo', required: false })
  @IsOptional()
  @IsNumber()
  resultScore?: number;
}
