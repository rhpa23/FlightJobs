import { ApiProperty } from '@nestjs/swagger';

export class JobFilterDto {
  @ApiProperty({ required: false })
  icao?: string;

  @ApiProperty({ required: false })
  airlineId?: number;

  @ApiProperty({ required: false })
  userId?: number;
}
