import { IsString, IsNumber, Min, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAirlineDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  requireCertificates: boolean;
}
