import { Controller, Get, Post, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NavdataService } from './navdata.service';
import { MapInfoDto } from './dto/map-info.dto';
import { ArrivalTipsDto } from './dto/arrival-tips.dto';
import { GenerateJobsDto, GeneratedJobDto } from './dto/generate-jobs.dto';
import { ConfirmJobsDto } from './dto/confirm-jobs.dto';
import { JobsService } from '../jobs/jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
export class NavdataController {
  constructor(
    private readonly navdataService: NavdataService,
    private readonly jobsService: JobsService
  ) {}

  @Get('distance')
  @ApiOperation({ summary: 'Calcula distância entre dois aeroportos em milhas' })
  @ApiQuery({ name: 'departure', description: 'ICAO do aeroporto de partida' })
  @ApiQuery({ name: 'arrival', description: 'ICAO do aeroporto de chegada' })
  calcDistance(@Query('departure') departure: string, @Query('arrival') arrival: string): number {
    return this.navdataService.calcDistance(departure, arrival);
  }

  @Get('map-info')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retorna informações de aeroportos para o mapa' })
  @ApiQuery({ name: 'departure', description: 'ICAO do aeroporto de partida', required: false })
  @ApiQuery({ name: 'arrival', description: 'ICAO do aeroporto de chegada', required: false })
  @ApiQuery({ name: 'alternative', description: 'ICAO do aeroporto alternativo', required: false })
  @ApiQuery({ name: 'iconsPath', description: 'Caminho para os ícones', required: false })
  async getMapInfo(
    @Query('departure') departure: string,
    @Query('arrival') arrival: string,
    @Query('alternative') alternative?: string,
    @Query('iconsPath') iconsPath?: string,
    @Request() req?: any
  ): Promise<MapInfoDto[]> {
    let favoriteIcaos: string[] = [];

    // Se houver usuário autenticado, busca os ICAOs dos jobs concluídos
    if (req && req.user && req.user.userId) {
      favoriteIcaos = await this.jobsService.getUserJobIcaos(req.user.userId);
    }

    return this.navdataService.getMapInfo(departure, arrival, alternative, iconsPath, favoriteIcaos);
  }

  @Get('arrival-tips')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retorna dicas de chegada para um aeroporto de partida' })
  @ApiQuery({ name: 'departure', description: 'ICAO do aeroporto de partida' })
  async getArrivalTips(
    @Query('departure') departure: string,
    @Request() req?: any
  ): Promise<ArrivalTipsDto[]> {
    let userJobs: any[] = [];

    // Se houver usuário autenticado, busca os jobs concluídos
    if (req && req.user && req.user.userId) {
      userJobs = await this.jobsService.getUserJobs(req.user.userId);
    }

    return this.navdataService.getArrivalTips(departure, userJobs);
  }

  @Get('alternative-tips')
  @ApiOperation({ summary: 'Retorna aeroportos alternativos dentro de um range específico' })
  @ApiQuery({ name: 'arrival', description: 'ICAO do aeroporto de destino' })
  @ApiQuery({ name: 'range', description: 'Range em milhas' })
  getAlternativeTips(
    @Query('arrival') arrival: string,
    @Query('range') range: number
  ): ArrivalTipsDto[] {
    return this.navdataService.getAlternativeTips(arrival, range);
  }

  @Get('random')
  @ApiOperation({ summary: 'Retorna um job aleatório com filtros opcionais' })
  @ApiQuery({ name: 'departure', description: 'ICAO do aeroporto de partida', required: false })
  @ApiQuery({ name: 'destination', description: 'ICAO do aeroporto de destino', required: false })
  async getRandomFlight(
    @Query('departure') departure?: string,
    @Query('destination') destination?: string
  ) {
    const randomJob = await this.jobsService.getRandomFlight(departure, destination);
    return randomJob || {};
  }

  @Get('simbrief')
  @ApiOperation({ summary: 'Busca dados do Simbrief API' })
  @ApiQuery({ name: 'username', description: 'Nome de usuário do Simbrief' })
  async getSimbriefData(@Query('username') username: string) {
    return this.navdataService.getSimbriefData(username);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Gera opções de jobs baseadas nos parâmetros de busca' })
  async generateJobs(@Body() generateDto: GenerateJobsDto): Promise<GeneratedJobDto[]> {
    return this.navdataService.generateJobs(generateDto);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirma e cria os jobs selecionados' })
  async confirmJobs(@Body() confirmDto: ConfirmJobsDto, @Request() req) {
    return this.navdataService.confirmJobs(confirmDto, req.user.userId);
  }
}
