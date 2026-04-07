import { ApiProperty } from '@nestjs/swagger';

export class StartJobResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ description: 'ICAO do aeroporto de chegada' })
  arrivalIcao: string;

  @ApiProperty({ description: 'Indica se a licença do piloto está expirada' })
  licenseExpired: boolean;
}
