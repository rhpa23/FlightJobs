import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinAirlineDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  airlineId: number;
}
