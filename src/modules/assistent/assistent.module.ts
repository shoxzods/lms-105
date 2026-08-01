import { Module } from '@nestjs/common';
import { AssistentService } from './assistent.service';
import { AssistentController } from './assistent.controller';
import { JwtService } from '@nestjs/jwt';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [AssistentService , JWTtoken],
  controllers: [AssistentController]
})
export class AssistentModule {}
