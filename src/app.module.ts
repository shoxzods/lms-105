import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { SeederModule } from './core/seed/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './common/guards/auth.guard';


@Module({
  imports:[
    ConfigModule.forRoot({isGlobal:true}),
    JwtModule.register({global:true}), 
    PrismaModule, 
    SeederModule, 
    AuthModule
]})

export class AppModule {} 