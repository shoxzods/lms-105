import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [StudentsService , JWTtoken],
  controllers: [StudentsController]
})
export class StudentsModule {}
