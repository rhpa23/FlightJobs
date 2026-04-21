import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123-def456-ghi789',
    description: 'Reset token received in email'
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'NewSecure123!',
    description: 'New password (min 8 characters)'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
