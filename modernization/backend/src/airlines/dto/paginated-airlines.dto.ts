import { ApiProperty } from '@nestjs/swagger';
import { Airline } from '../entities/airline.entity';

export class PaginatedAirlinesDto {
  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  isFirstPage: boolean;

  @ApiProperty()
  isLastPage: boolean;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  pageNumber: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalItemCount: number;

  @ApiProperty({ type: [Airline] })
  airlines: Airline[];
}
