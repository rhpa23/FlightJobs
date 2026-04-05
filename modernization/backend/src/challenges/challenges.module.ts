import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';

@Module({
  controllers: [ChallengesController],
  exports: [],
})
export class ChallengesModule {}
