import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('challenges')
@Controller('challenges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChallengesController {
  @Get()
  @ApiOperation({ summary: 'List available challenges' })
  findAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get challenge details' })
  findOne(@Param('id') id: number) {
    return { id };
  }

  @Post()
  @ApiOperation({ summary: 'Create challenge' })
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return createChallengeDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete challenge' })
  remove(@Param('id') id: number) {
    return { message: `Challenge ${id} deleted` };
  }
}
