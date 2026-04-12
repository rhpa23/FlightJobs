import { Module, forwardRef } from '@nestjs/common';
import { NavdataService } from './navdata.service';
import { NavdataController } from './navdata.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [forwardRef(() => JobsModule)],
  controllers: [NavdataController],
  providers: [NavdataService],
  exports: [NavdataService],
})
export class NavdataModule {}
