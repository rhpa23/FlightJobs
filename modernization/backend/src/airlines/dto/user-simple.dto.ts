import { ApiProperty } from '@nestjs/swagger';

export class UserSimpleDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  email: string;
}
