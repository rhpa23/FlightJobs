import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class HireFboDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  icao: string;
}
