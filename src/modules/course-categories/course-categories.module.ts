import { Module } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [CourseCategoriesService , JWTtoken],
  controllers: [CourseCategoriesController]
})
export class CourseCategoriesModule {}
