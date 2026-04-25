import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnsubscribeDto {
  @ApiProperty({ description: 'User ID or email token for unsubscribe' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
