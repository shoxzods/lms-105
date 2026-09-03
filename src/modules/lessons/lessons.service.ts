import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonMaterialDto } from './dto/create-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-material.dto';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

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

    async createLessonMaterial(payloud:CreateLessonMaterialDto , files:Express.Multer.File[]) {
        const existLesson = await this.prisma.lessons.findUnique({where:{id:payloud.lessonId}})

        if(!existLesson)
            throw new NotFoundException("lesson not found")


        const material = await this.prisma.material.create({
            data: {
                lesson_id:existLesson.id,
                description:payloud.description,
            }
        });

        await this.prisma.materialFile.createMany({
            data: files.map((file:{filename:string}) => ({
                material_id:material.id,
                file:file.filename
            }))
        });

        return {
            success:true,
            message: "lesson material created succesfully"
        }
    }


    async getAllLessonMaterials(page:number , limit:number) {
       const materials = await this.prisma.material.findMany({
          select: {
            id: true,
            description: true,
            created_at: true,
            updated_at: true,
        
            lessons: {
              select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
              },
            },
        
            materialFiles: {
              select: {
                id: true,
                file: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
            take: limit,
            skip: limit * (page - 1), 
        });

        return {
            success:true,
            data:materials
        }
    }


    async deleteLessonMaterial(id:number) {
        const existLessonMaterial = await this.prisma.material.findUnique({where:{id}});

        if(!existLessonMaterial)
            throw new NotFoundException("lesson material not found")
        
        await Promise.all([
            this.prisma.materialFile.deleteMany({where:{material_id:existLessonMaterial.id}}),
            this.prisma.material.delete({where:{id:id}})
        ]);

        return {
            success:true,
            message:"lesson material removed successfully"
        }
    }

    async getOneLessonMaterial(id:number) {
        const material = await this.prisma.material.findUnique({
          where:{
            id
          },
          select: {
            id: true,
            description: true,
            created_at: true,
            updated_at: true,
        
            lessons: {
              select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
              },
            },
        
            materialFiles: {
              select: {
                id: true,
                file: true,
                created_at: true,
                updated_at: true,
              },
            },
          },
        });
        

        if(!material)
            throw new NotFoundException("lesson material not found")

        return {
            success:true,
            data:material
        }
    }

    async updateLessonMaterial(payloud:UpdateLessonMaterialDto, id:number , files:Express.Multer.File[]) {
        const existLessonMaterial = await this.prisma.material.findUnique({where:{id}});

        if(!existLessonMaterial)
            throw new NotFoundException("lesson material not found")

        const existLesson = payloud.lessonId ? await this.prisma.lessons.findUnique({where:{id:payloud.lessonId}}) : "false";

        if(!existLesson)
            throw new NotFoundException("lesson not found")

        await Promise.all([

            this.prisma
                .material
                .update(
                    {
                        where:{
                            id:existLessonMaterial.id
                        },
                        data:{
                            lesson_id: existLesson == 'false' ? existLessonMaterial.lesson_id : existLesson.id,
                            description: payloud.description ? payloud.description : existLessonMaterial.description
                        }
                    }),

                    this.prisma.materialFile.deleteMany({where:{material_id:existLessonMaterial.id}})
        ]);


        if(files)
            await this.prisma.materialFile.createMany({
                data: files.map((file:{filename:string}) => ({
                    material_id:existLessonMaterial.id,
                    file:file.filename
                }))
            });

        return {
            success:true,
            message:"lesson material updated successfully"
        }
    }


    async createHomework( payloud:CreateHomeworkDto, file:Express.Multer.File ) {
        const existLesson = await this.prisma.lessons.findUnique({where:{id:payloud.lessonId}});

        if(!existLesson) 
            throw new NotFoundException("lesson not found")
        
        await this
                .prisma
                .homeWorks
                .create(
                    {
                        data: {
                            title:payloud.title,
                            lesson_id:existLesson.id,
                            file: file ? Date.now() + "." + file.mimetype.split('/')[1] : null
                        }
                    })
        
        return {
            success:true,
            message:"homework created successfully"
        }
    }

    async getAllHomeworks(limit:number , page:number) {
        const homeworks = await this
                                .prisma
                                .homeWorks
                                .findMany(
                        {
                           take: limit,
                           skip: limit * (page - 1), 
                        });

        return {
            success:true,
            data:homeworks
        }
    }

    async getOneLessonHomework(id:number) {
        const existHomework = await this.prisma.homeWorks.findUnique({where:{id}});

        if(!existHomework)
            throw new NotFoundException("lesson homework not found")

        return {
            success:true,
            data: existHomework
        }
    }

    async deleteLessonHomework(id:number) {
        const existHomework = await this.prisma.homeWorks.findUnique({where:{id}});

        if(!existHomework)
            throw new NotFoundException("lesson homework not found")

        await this.prisma.homeWorks.delete({where:{id}});

        return {
            success:true,
            message:"lesson homework deleted successfully"
        }
    }

    async updateLessonHomework(payloud:UpdateHomeworkDto , id:number , file:Express.Multer.File) {
        const existHomework = await this.prisma.homeWorks.findUnique({where:{id}})

        if(!existHomework) 
            throw new NotFoundException("homework not found")
        
        const existLesson = payloud.lessonId ? await this.prisma.lessons.findUnique({where:{id:payloud.lessonId}}) : true;

        if(!existLesson)
            throw new NotFoundException("lesson not found")

        await this
                .prisma
                .homeWorks
                .update(
                    {
                        where:{
                            id:existHomework.id
                        },
                        data: {
                            title:payloud.title ? payloud.title : existHomework.title,
                            lesson_id: payloud.lessonId ? payloud.lessonId : existHomework.lesson_id,
                            file: file ? Date.now() + "." + file.mimetype.split('/')[1] : existHomework.file
                        }
                    })

        return {
            success:true,
            message:"lesson homework updated successfully"
        }
    }

    async createLessonExam(payload:CreateExamDto) {
        const existLesson = await this.prisma.lessons.findUnique({where:{id:payload.lesson_id}});

        if(!existLesson) 
            throw new NotFoundException("lesson not found")

        await this.prisma.exams.create({
            data: {
                question:payload.question,
                lesson_id:payload.lesson_id,
                variantA:payload.variantA,
                variantB:payload.variantB,
                variantC:payload.variantC,
                variantD:payload.variantD,
                answer:payload.answer
            }
        })

        return {
            success:true,
            message:"exam created successfully"
        }
    }

    async getAllExams(page:number , limit:number) {
        const exams = await this
                            .prisma
                            .exams
                            .findMany(
                                {
                                    take:limit , 
                                    skip:limit * (page - 1)
                                });
        return {
            success:true,
            data:exams
        }
    }

    async getOneExam(id:number) {
        const existExam = await this.prisma.exams.findUnique({where:{id}});

        if(!existExam)
            throw new NotFoundException("exam not found")
        return {
            success:true,
            data:existExam
        }
    }

    async deleteExam(id:number) {
        const existExam = await this.prisma.exams.findUnique({where:{id}});

        if(!existExam)
            throw new NotFoundException("exam not found")
        
        await this.prisma.exams.delete({where:{id}});

        return {
            success:true,
            message:"exam was deleted successfully"
        }
    }

    async updateExam(payload:UpdateExamDto , id:number) {
        const existExam = await this.prisma.exams.findUnique({where:{id}});

        if(!existExam) 
            throw new NotFoundException("exam not found")

        const existLesson = payload.lesson_id ? await this.prisma.lessons.findUnique({where:{id:payload.lesson_id}}) : true;

        if(!existLesson)
            throw new NotFoundException("lesson not found")

        await this
                .prisma
                .exams
                .update(
                    {
                        where:{
                            id
                        },
                        data: {
                            lesson_id: payload.lesson_id ? payload.lesson_id : existExam.lesson_id,
                            question: payload.question ? payload.question : existExam.question,
                            variantA:payload.variantA ? payload.variantA : existExam.variantA,
                            variantB:payload.variantA ? payload.variantA : existExam.variantB,
                            variantC:payload.variantA ? payload.variantA : existExam.variantC,
                            variantD:payload.variantA ? payload.variantA : existExam.variantD,
                            answer:payload.answer ? payload.answer : existExam.answer
                        }
                    }
                )

        return {
            success:true,
            message:"exam updated successfully"
        }
    }
}