import { IsArray, IsNumber, IsString, IsOptional, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmJobDto {
  @ApiProperty({ description: 'ICAO de partida' })
  @IsString()
  @Length(4, 4)
  departureICAO: string;

  @ApiProperty({ description: 'ICAO de chegada' })
  @IsString()
  @Length(4, 4)
  arrivalICAO: string;

  @ApiProperty({ required: false, description: 'ICAO alternativo' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  alternativeICAO?: string;

  @ApiProperty({ description: 'Distância em NM' })
  @IsNumber()
  @Min(0)
  distance: number;

  @ApiProperty({ required: false, description: 'Número de passageiros' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pax?: number;

  @ApiProperty({ required: false, description: 'Peso da carga em kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cargo?: number;

  @ApiProperty({ description: 'Pagamento' })
  @IsNumber()
  @Min(0)
  pay: number;

  @ApiProperty({ required: false, description: 'Tipo de aviação' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aviationType?: number;

  @ApiProperty({ required: false, description: 'Primeira classe' })
  @IsOptional()
  firstClass?: boolean;

  @ApiProperty({ required: false, description: 'Peso por passageiro' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paxWeight?: number;
}

export class ConfirmJobsDto {
  @ApiProperty({ description: 'Lista de jobs a confirmar' })
  @IsArray()
  jobs: ConfirmJobDto[];
}
