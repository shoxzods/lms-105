import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWTtoken } from 'src/common/config/jwt';

@Module({
  providers: [AdminsService , JWTtoken],
  controllers: [AdminsController]
})
export class AdminsModule {}
