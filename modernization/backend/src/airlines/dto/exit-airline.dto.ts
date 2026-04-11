import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class ExitAirlineDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  airlineId: number;
}
