import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NavdataService } from './navdata.service';
import { MapInfoDto } from './dto/map-info.dto';
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
}
