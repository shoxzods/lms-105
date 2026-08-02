import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JWTtoken } from 'src/common/config/jwt';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [UsersService , JWTtoken],
  controllers: [UsersController]
})
export class UsersModule {}
