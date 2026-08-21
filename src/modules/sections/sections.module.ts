import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [SectionsService , JWTtoken],
  controllers: [SectionsController]
})
export class SectionsModule {}
