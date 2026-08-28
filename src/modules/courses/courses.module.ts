import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { JWTtoken } from '../../common/config/jwt';

@Module({
  providers: [CoursesService , JWTtoken],
  controllers: [CoursesController]
})
export class CoursesModule {}