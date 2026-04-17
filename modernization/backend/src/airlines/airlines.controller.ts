import { Controller, Get, Post, Param, Body, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AirlinesService } from './airlines.service';
import { PaginatedAirlineFilterDto } from './dto/paginated-airline-filter.dto';
import { AirlineToDto } from './dto/airline-to.dto';
import { PayDebtDto } from './dto/pay-debt.dto';
import { HireFboDto } from './dto/hire-fbo.dto';
import { JoinAirlineDto } from './dto/join-airline.dto';
import { ExitAirlineDto } from './dto/exit-airline.dto';
import { JobFilterDto } from './dto/job-filter.dto';
import { PaginatedAirlinesDto } from './dto/paginated-airlines.dto';
import { PaginatedAirlineJobsDto } from './dto/paginated-airline-jobs.dto';
import { UserSimpleDto } from './dto/user-simple.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAirlineDto } from './dto';
import { Airline } from './entities/airline.entity';

@ApiTags('airlines')
@Controller('airlines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AirlinesController {
  constructor(private readonly airlinesService: AirlinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all airlines' })
  async findAll(): Promise<Airline[]> {
    return this.airlinesService.findAll();
  }

  @Post('airliners')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated airlines with filtering' })
  async getAirliners(
    @Query('sortOrder') sortOrder: string,
    @Query('currentSort') currentSort: string,
    @Query('pageNumber') pageNumber: number,
    @Body() airlineFilter: PaginatedAirlineFilterDto
  ): Promise<PaginatedAirlinesDto> {
    return this.airlinesService.getAirliners(
      sortOrder,
      currentSort,
      pageNumber,
      airlineFilter
    );
  }

  @Get(':id/pilots-hired')
  @ApiOperation({ summary: 'Get pilots hired by airline' })
  async getPilotsHired(@Param('id') id: number): Promise<UserSimpleDto[]> {
    return this.airlinesService.getPilotsHired(id);
  }

  @Get(':id/fbos')
  @ApiOperation({ summary: 'Get airline FBOs' })
  async getAirlineFBOs(@Param('id') id: number): Promise<any[]> {
    return this.airlinesService.getAirlineFBOs(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create airline' })
  async createAirline(@Body() airlineTo: CreateAirlineDto, @Request() req): Promise<any> {
    return this.airlinesService.createAirline(airlineTo, req.user.userId);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update airline' })
  async updateAirline(@Body() airlineTo: AirlineToDto, @Request() req): Promise<boolean> {
    return this.airlinesService.updateAirline(airlineTo, req.user.userId);
  }

  @Post('pay-debts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay airline debts' })
  async payAirlineDebts(@Body() payDebtDto: PayDebtDto, @Request() req): Promise<boolean> {
    return this.airlinesService.payAirlineDebts(payDebtDto, req.user.userId);
  }

  @Post(':airlineId/ledger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get airline ledger with pagination' })
  async getAirlineLedger(
    @Param('airlineId') airlineId: number,
    @Query('pageNumber') pageNumber: number,
    @Body() jobFilter: JobFilterDto
  ): Promise<PaginatedAirlineJobsDto> {
    return this.airlinesService.getAirlineLedger(airlineId, pageNumber, jobFilter);
  }

  @Get('fbos')
  @ApiOperation({ summary: 'Get FBOs by ICAO and airline' })
  async getFOBs(
    @Query('icao') icao: string,
    @Query('airlineId') airlineId: number
  ): Promise<any[]> {
    return this.airlinesService.getFOBs(icao, airlineId);
  }

  @Post('hire-fbo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hire airline FBO' })
  async hireAirlineFbo(@Body() hireFboTo: HireFboDto, @Request() req): Promise<any> {
    return this.airlinesService.hireAirlineFbo(hireFboTo, req.user.userId);
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join airline' })
  async joinAirline(@Body() joinAirlineDto: JoinAirlineDto, @Request() req): Promise<string> {
    return this.airlinesService.joinAirline(joinAirlineDto.airlineId, req.user.userId);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join airline by ID' })
  async joinAirlineById(@Param('id') id: number, @Request() req): Promise<string> {
    return this.airlinesService.joinAirline(id, req.user.userId);
  }

  @Post('exit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exit airline' })
  async exitAirline(@Body() exitAirlineDto: ExitAirlineDto, @Request() req): Promise<void> {
    return this.airlinesService.exitAirline(exitAirlineDto.airlineId, req.user.userId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exit airline by ID' })
  async exitAirlineById(@Param('id') id: number, @Request() req): Promise<void> {
    return this.airlinesService.exitAirline(id, req.user.userId);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'Get airline ranking' })
  async getRanking(): Promise<any[]> {
    return this.airlinesService.getRanking();
  }

  @Get('my-airline')
  @ApiOperation({ summary: 'Get current user airline' })
  async getMyAirline(@Request() req): Promise<any> {
    return this.airlinesService.getMyAirline(req.user.userId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get airline statistics' })
  async getStatistics(@Param('id') id: number): Promise<any> {
    return this.airlinesService.getStatistics(id);
  }
}
