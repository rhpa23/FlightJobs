import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetLogbookDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsString()
  departureFilter?: string;

  @IsOptional()
  @IsString()
  arrivalFilter?: string;

  @IsOptional()
  @IsString()
  modelDescriptionFilter?: string;
}

export interface LogbookEntry {
  id: number;
  departureICAO: string;
  arrivalICAO: string;
  startTime: Date;
  endTime: Date;
  modelDescription: string;
  modelName: string;
  distance: number;
  pax: number;
  cargo: number;
  pay: number;
  flightTime: string;
  usedFuelWeightDisplay: number;
  payloadDisplay: number;
  videoUrl?: string;
  videoDescription?: string;
}

export interface LogbookResponse {
  entries: LogbookEntry[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}
