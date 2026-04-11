import { IsOptional, IsNumber, IsString, IsBoolean, IsDate, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ required: false, description: 'Weight per passenger' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paxWeight?: number;

  @ApiProperty({ required: false, description: 'Departure airport ICAO code' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  departureICAO?: string;

  @ApiProperty({ required: false, description: 'Arrival airport ICAO code' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  arrivalICAO?: string;

  @ApiProperty({ required: false, description: 'Alternative airport ICAO code' })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  alternativeICAO?: string;

  @ApiProperty({ required: false, description: 'Distance' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distance?: number;

  @ApiProperty({ required: false, description: 'Number of passengers' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pax?: number;

  @ApiProperty({ required: false, description: 'Cargo weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cargo?: number;

  @ApiProperty({ required: false, description: 'Payment amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pay?: number;

  @ApiProperty({ required: false, description: 'First class flight' })
  @IsOptional()
  @IsBoolean()
  firstClass?: boolean;

  @ApiProperty({ required: false, description: 'Model name' })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({ required: false, description: 'Model description' })
  @IsOptional()
  @IsString()
  modelDescription?: string;

  @ApiProperty({ required: false, description: 'Start fuel weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  startFuelWeight?: number;

  @ApiProperty({ required: false, description: 'Finish fuel weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finishFuelWeight?: number;

  @ApiProperty({ required: false, description: 'Aviation type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aviationType?: number;

  @ApiProperty({ required: false, description: 'Video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false, description: 'Video description' })
  @IsOptional()
  @IsString()
  videoDescription?: string;

  @ApiProperty({ required: false, description: 'Challenge creator user ID' })
  @IsOptional()
  @IsString()
  challengeCreatorUserId?: string;

  @ApiProperty({ required: false, description: 'Is challenge' })
  @IsOptional()
  @IsBoolean()
  isChallenge?: boolean;

  @ApiProperty({ required: false, description: 'Challenge expiration date' })
  @IsOptional()
  @IsDate()
  challengeExpirationDate?: Date;

  @ApiProperty({ required: false, description: 'Challenge type' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  challengeType?: number;

  @ApiProperty({ required: false, description: 'Pilot score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pilotScore?: number;
}
