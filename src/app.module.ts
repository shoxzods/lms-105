import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { SeederModule } from './core/seed/seeder.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './modules/users/users.module';
import { AdminsModule } from './modules/admins/admins.module';
import { MentorModule } from './modules/mentor/mentor.module';
import { AssistentModule } from './modules/assistent/assistent.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CourseCategoriesModule } from './modules/course-categories/course-categories.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';


@Module({
  imports:[
    ConfigModule.forRoot({isGlobal:true}),
    JwtModule.register({global:true}),
    ServeStaticModule.forRoot({
      rootPath:join(process.cwd() , "src" , "uploads"),
      serveRoot:"/uploads"
    }),
    PrismaModule, 
    SeederModule, 
    AuthModule, UsersModule, AdminsModule, MentorModule, AssistentModule, StudentsModule, CoursesModule, CourseCategoriesModule, SectionsModule, LessonsModule
]})

export class AppModule {} 