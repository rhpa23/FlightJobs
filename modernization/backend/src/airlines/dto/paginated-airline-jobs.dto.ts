import { ApiProperty } from '@nestjs/swagger';

export class PaginatedAirlineJobsDto {
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

  @ApiProperty()
  airlineJobs: any[];
}
