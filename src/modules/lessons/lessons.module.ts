import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [LessonsService , JWTtoken],
  controllers: [LessonsController]
})
export class LessonsModule {}
