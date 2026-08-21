import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { it } from 'node:test';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { FileWatcherEventKind } from 'typescript';

@Injectable()
export class LessonsService {
    constructor(private prisma:PrismaService) {}

    async getAllLessons(page: number, limit: number) {
  
  const lessons = await this.prisma.lessons.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      video_file: true,
      section_id: true,
    },
    take: limit,
    skip: limit * (page - 1),
  });

  const newData = await Promise.all(
    lessons.map(async (item) => {
      const section = await this.prisma.section.findUnique({
        where: {
          id: item.section_id,
        },
        select: {
          course_id: true,
          course: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        video_file: item.video_file,

        course: section
          ? {
              id: section.course_id,
              name: section.course.name,
            }
          : null,
      };
    }),
  );

  return {
    success: true,
    data: newData,
  };
}

    async createLesson(payload:CreateLessonDto , file:Express.Multer.File) {
        const existSection = await this.prisma.section.findUnique({where:{id:payload.sectionId}});

        if(!existSection) {
            throw new NotFoundException("section not found")
        }

        const video_file = file ? Date.now() + "." + file.mimetype.split("/")[1] : null;

        const existUnique = await this.prisma.lessons.findFirst({where:{name:payload.name , section_id: payload.sectionId}});

        if(existUnique) {
            throw new ConflictException("Lesson with this name already exists in this section")
        }

        await this.prisma.lessons.create(
            {
                data:{
                    section_id:payload.sectionId,
                    name:payload.name, 
                    description:payload.description,
                    video_file:video_file
                }
            });

        return {
            success:true,
            message:"lesson created successfully"
        }
    }

    async deleteLesson(id:number) {
        const existLesson = await this.prisma.lessons.findUnique({where:{id:id}});

        if(!existLesson) {
            throw new NotFoundException("lesson not found")
        }

        await this.prisma.lessons.delete({where:{id:id}})

        return {
            success:true,
            message:"Lesson deleted successfully"
        }
    }

    async updateLesson(payload:UpdateLessonDto , file:Express.Multer.File , id:number) {
        const existLesson = await this.prisma.lessons.findUnique({where:{id:id}});

        if(!existLesson) {
            throw new NotFoundException("lesson not found")
        }

        const existSection = await this.prisma.section.findUnique({where:{id:payload.sectionId}});

        if(!existSection) {
            throw new NotFoundException("section not found")
        }

        const existUnique = await this.prisma.lessons.findFirst({where:{name:payload.name , section_id: payload.sectionId}});

        if(existUnique) {
            throw new ConflictException("Lesson with this name already exists in this section")
        }

        await this.prisma.lessons.update(
            {
                where:{id:id} , 
                data:{
                    name:payload.name ? payload.name : existLesson.name , 
                    section_id:payload.sectionId ? payload.sectionId : existLesson.section_id , 
                    description:payload.description ? payload.description : existLesson.description
                }
            });

        return {
            success:true,
            message:"lesson updated successfully"
        }
    }

}