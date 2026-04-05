import { IsOptional, IsString, IsNumber, Min, Max, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchJobsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  departure?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(4, 4)
  arrival?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(450)
  range?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  aviationType?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  customPlaneCapacityId?: number;
}
