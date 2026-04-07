import { ApiProperty } from '@nestjs/swagger';
import { Job } from '../entities/job.entity';

export class FinishJobResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ description: 'Job finalizado', type: Job, required: false })
  finishedJob?: Job;

  @ApiProperty({ description: 'Indica se a licença do piloto está expirada' })
  licenseExpired: boolean;
}
