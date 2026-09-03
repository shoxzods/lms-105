import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { HttpThrottlerGuard } from "./common/guards/http-throttler.guard";
import { PrismaModule } from "./core/database/prisma.module";
import { CommonModule } from "./common/common.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SeederModule } from "./core/seed/seeder.module";
import { UsersModule } from "./modules/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./modules/auth/auth.module";
import { MentorModule } from "./modules/mentor/mentor.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CoursesModule } from "./modules/courses/courses.module";
import { AssistantModule } from "./modules/assistant/assistant.module";
import { SectionsModule } from "./modules/sections/sections.module";
import { LessonsModule } from "./modules/lessons/lessons.module";
import { MaterialsModule } from "./modules/materials/materials.module";
import { HomeworksModule } from "./modules/homeworks/homeworks.module";
import { PublicModule } from "./modules/public/public.module";
import { ExamModule } from "./modules/exam/exam.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { BotModule } from "./modules/bot/bot.module";
import { ChatModule } from "./modules/chat/chat.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("SECRET_KEY"),
      }),
    }),
    PrismaModule,
    CommonModule,
    SeederModule,
    UsersModule,
    AuthModule,
    MentorModule,
    CategoriesModule,
    CoursesModule,
    AssistantModule,
    SectionsModule,
    LessonsModule,
    MaterialsModule,
    HomeworksModule,
    PublicModule,
    ExamModule,
    PaymentsModule,
    ThrottlerModule.forRoot({
      throttlers: [{ name: "default", ttl: 60000, limit: 100 }],
    }),
    BotModule,
    ChatModule,
    DashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: HttpThrottlerGuard }],
})
export class AppModule {}
