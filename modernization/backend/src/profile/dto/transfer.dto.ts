import { IsNumber, Min, Max } from 'class-validator';

export class TransferFundsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;
}
