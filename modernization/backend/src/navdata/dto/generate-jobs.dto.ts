import { IsOptional, IsString, IsNumber, IsBoolean, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateJobsDto {
  @ApiProperty({ description: 'ICAO do aeroporto de partida' })
  @IsString()
  @Length(4, 4)
  departure: string;

  @ApiProperty({ description: 'ICAO do aeroporto de chegada' })
  @IsString()
  @Length(4, 4)
  arrival: string;

  @ApiProperty({ required: false, description: 'ICAO do aeroporto alternativo' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  alternative?: string;

  @ApiProperty({ description: 'Tipo de aviação' })
  @IsString()
  aviationType: string;

  @ApiProperty({ required: false, description: 'ID da capacidade personalizada' })
  @IsOptional()
  @IsNumber()
  capacityId?: number;

  @ApiProperty({ required: false, description: 'Número de passageiros' })
  @IsOptional()
  @IsNumber()
  passengers?: number;

  @ApiProperty({ required: false, description: 'Peso por passageiro' })
  @IsOptional()
  @IsNumber()
  paxWeight?: number;

  @ApiProperty({ required: false, description: 'Peso da carga' })
  @IsOptional()
  @IsNumber()
  cargoWeight?: number;

  @ApiProperty({ required: false, description: 'ID do usuário para buscar estatísticas' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class GeneratedJobDto {
  @ApiProperty({ description: 'ID do job (opcional para novos jobs)' })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'Tipo do job' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Categoria do job (cargo ou passenger)' })
  @IsString()
  typeCategory: 'cargo' | 'passenger';

  @ApiProperty({ description: 'Payload formatado' })
  @IsString()
  payload: string;

  @ApiProperty({ description: 'Pagamento formatado' })
  @IsString()
  pay: string;

  @ApiProperty({ required: false, description: 'ICAO de partida' })
  @IsOptional()
  @IsString()
  departureICAO?: string;

  @ApiProperty({ required: false, description: 'ICAO de chegada' })
  @IsOptional()
  @IsString()
  arrivalICAO?: string;

  @ApiProperty({ required: false, description: 'ICAO alternativo' })
  @IsOptional()
  @IsString()
  alternativeICAO?: string;

  @ApiProperty({ required: false, description: 'Distância em NM' })
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiProperty({ required: false, description: 'Número de passageiros' })
  @IsOptional()
  @IsNumber()
  pax?: number;

  @ApiProperty({ required: false, description: 'Peso da carga em kg' })
  @IsOptional()
  @IsNumber()
  cargo?: number;

  @ApiProperty({ required: false, description: 'Pagamento numérico' })
  @IsOptional()
  @IsNumber()
  payAmount?: number;

  @ApiProperty({ required: false, description: 'Tipo de aviação' })
  @IsOptional()
  @IsNumber()
  aviationType?: number;

  @ApiProperty({ required: false, description: 'Primeira classe' })
  @IsOptional()
  @IsBoolean()
  firstClass?: boolean;

  @ApiProperty({ required: false, description: 'Peso por passageiro' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paxWeight?: number;
}
