import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomCapacityService } from './custom-capacity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('custom-capacity')
@Controller('custom-capacity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CustomCapacityController {
  constructor(private readonly customCapacityService: CustomCapacityService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna todas as capacidades personalizadas do usuário' })
  async getUserCapacities(@Request() req: any) {
    return this.customCapacityService.getUserCapacities(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma capacidade por ID' })
  async getCapacityById(@Param('id') id: number) {
    return this.customCapacityService.getCapacityById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Salva ou atualiza uma capacidade personalizada' })
  async saveCapacity(
    @Body() body: {
      planeName: string;
      paxCapacity: number;
      cargoCapacity: number;
      paxWeight: number;
      imageUrl?: string;
    },
    @Request() req: any,
  ) {
    return this.customCapacityService.saveCapacity(
      req.user.userId,
      body.planeName,
      body.paxCapacity,
      body.cargoCapacity,
      body.paxWeight,
      body.imageUrl,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma capacidade existente' })
  async updateCapacity(
    @Param('id') id: number,
    @Body() body: {
      planeName: string;
      paxCapacity: number;
      cargoCapacity: number;
      paxWeight: number;
      imageUrl?: string;
    },
    @Request() req: any,
  ) {
    return this.customCapacityService.updateCapacity(
      id,
      req.user.userId,
      body.planeName,
      body.paxCapacity,
      body.cargoCapacity,
      body.paxWeight,
      body.imageUrl,
    );
  }

  @Post(':id/select')
  @ApiOperation({ summary: 'Seleciona uma capacidade como ativa' })
  async selectCapacity(@Param('id') id: number, @Request() req: any) {
    return this.customCapacityService.selectCapacity(id, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma capacidade' })
  async removeCapacity(@Param('id') id: number, @Request() req: any) {
    await this.customCapacityService.removeCapacity(id, req.user.userId);
    return { message: 'Capacity removed successfully' };
  }
}
