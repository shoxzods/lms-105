import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { SeederModule } from './core/seed/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './common/guards/auth.guard';
import { UsersModule } from './modules/users/users.module';


@Module({
  imports:[
    ConfigModule.forRoot({isGlobal:true}),
    JwtModule.register({global:true}), 
    PrismaModule, 
    SeederModule, 
    AuthModule, UsersModule
]})

export class AppModule {} 