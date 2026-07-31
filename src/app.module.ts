import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { SeederModule } from './core/seed/seeder.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}) , PrismaModule , SeederModule]
})
export class AppModule {}
