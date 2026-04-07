import { Module } from '@nestjs/common';
import { NavdataService } from './navdata.service';

@Module({
  providers: [NavdataService],
  exports: [NavdataService],
})
export class NavdataModule {}
