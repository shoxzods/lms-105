import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { JWTtoken } from '../../common/config/jwt';

@Module({
  providers: [MentorService , JWTtoken],
  controllers: [MentorController]
})
export class MentorModule {}
