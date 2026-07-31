import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [AuthService , JWTtoken],
  controllers: [AuthController]
})
export class AuthModule {}
