import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PayDebtDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
