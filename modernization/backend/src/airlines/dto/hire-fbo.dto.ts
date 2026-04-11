import { ApiProperty } from '@nestjs/swagger';

export class HireFboDto {
  @ApiProperty()
  icao: string;

  @ApiProperty()
  userId: number;
}
