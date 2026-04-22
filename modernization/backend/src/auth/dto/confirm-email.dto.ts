import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({
    example: 'abc123-def456-ghi789',
    description: 'User ID received in email'
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
