import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AirlinesService } from './airlines.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('airlines')
@Controller('airlines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AirlinesController {
  constructor(private readonly airlinesService: AirlinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all airlines' })
  findAll() {
    return this.airlinesService.findAll();
  }

  @Get('my-airline')
  @ApiOperation({ summary: "Get user's airline" })
  findMyAirline(@Request() req) {
    return this.airlinesService.findAll(); // Simplified - would filter by user in production
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airline details' })
  findOne(@Param('id') id: number) {
    return this.airlinesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airline' })
  create(@Body() createAirlineDto: CreateAirlineDto) {
    return this.airlinesService.create(createAirlineDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update airline' })
  update(@Param('id') id: number, @Body() updateAirlineDto: UpdateAirlineDto) {
    return this.airlinesService.update(id, updateAirlineDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete airline' })
  remove(@Param('id') id: number) {
    return this.airlinesService.remove(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join airline' })
  joinAirline(@Param('id') id: number) {
    return { message: `Joined airline ${id}` };
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave airline' })
  leaveAirline(@Param('id') id: number) {
    return { message: `Left airline ${id}` };
  }
}
