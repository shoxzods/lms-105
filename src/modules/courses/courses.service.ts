import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
    constructor(private prisma:PrismaService){}

    async getAllCourses(page:number , limit:number) {
        const courses = await this.prisma.courses.findMany({
            select:{
                id:true,
                name:true,
                sections:true,
                prize:true,
                category:true,
            },
            take:limit,
            skip:limit*(page -1)
        })

        console.log(courses);

        return {
            success:true,
            data:courses
        }
    }

    async getOneCourse(id:number) {
            const existsCourse = await this.prisma.courses.findFirst(
            {
                where:
                    {
                        id:id
                    },
                select: {
                    id:true,
                    banner:true,
                    name:true,
                    description:true,
                    assistant_id:true,
                    level:true,
                    prize:true,
                    category:true,
                    created_at:true
                }
            });

            if(!existsCourse) {
                throw new NotFoundException('course not found')
            }

            const changeCourse = {
                id:existsCourse.id,
                banner:existsCourse.banner,
                name:existsCourse.name,
                description:existsCourse.description,
                level:existsCourse.level,
                prize:existsCourse.prize,
                category:existsCourse.category
            }

            const assistantId = !existsCourse.assistant_id  ? undefined : existsCourse.assistant_id;

            const courseAssistant = await this.prisma.users.findFirst(
                {where:{
                    id:assistantId
                } , 
                select:{
                    id:true,
                    full_name:true
                }});

            return {
                success:true,
                data: {
                    ...changeCourse,
                    assistant: !assistantId ? null : courseAssistant
                }
            }
    }

    async addAssistentToCourse( course_id:number , assistant_id:number) {
        const existsCourse = await this.prisma.courses.findUnique({where:{id:course_id}});

        if(!existsCourse) {
            throw new NotFoundException("course not found")
        }

        const existAssistant = await this.prisma.users.findMany({where:{role:"ASSISTANT" , id:assistant_id}});

        if( !existAssistant ) {
            throw new NotFoundException("assistant with this id does not exists")
        }

        const courseHaveAssistant = await this.prisma.courses.findFirst({where:{id:course_id} , select:{assistant_id:true}});

        if(courseHaveAssistant?.assistant_id) {
            throw new ConflictException("this course already has an assistant")
        }

        await this.prisma.courses.update({where:{id:course_id} , data:{assistant_id:assistant_id}});

        return {
            success:true,
            message:"assistant added to group successfully"
        }
    }

    async createCourse(payloud:CreateCourseDto , files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]}) {
        const video = files.intro_video;
        const image = files.banner;

        if ( video && video[0].size > 5 * 1024 * 1024)
            throw new BadRequestException("intro_video size must be less than 5MB")
        
        const existsCourse = await this.prisma.courses.findUnique({where:{name:payloud.name}});

        if( existsCourse ) 
            throw new ConflictException("course already exists")
        
        await this.prisma.courses.create(
            {
                data:{
                    name:payloud.name , 
                    description:payloud.description ,
                    prize:payloud.prize,
                    level:payloud.level,
                    banner: image ? Date.now() +"."+ image[0].mimetype.split("/")[1] : "null" ,
                    intro_video: video ? Date.now() +"."+ video[0].mimetype.split("/")[1] : null,
                }
            });
                
        return {
            success:true,
            message:"Course created successfully"
        }
    }

    async deleteOneCourse(id:number) {
        const existCourse = await this.prisma.courses.findUnique({where:{id:id}});


        if(!existCourse) {
            throw new NotFoundException("course not found")
        }

        await this.prisma.courses.delete({where:{id:id}});

        return {
            success:true,
            message:"course deleted successfully"
        }
    }

    async updateCourse(payloud:UpdateCourseDto , files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]} , id:number) {
                
        const video = files.intro_video;
        const image = files.banner;

        if ( video && video[0].size > 5 * 1024 * 1024)
            throw new BadRequestException("intro_video size must be less than 5MB")

        const existCourse = await this.prisma.courses.findUnique({where:{id:id}});

        if(!existCourse) {
            throw new NotFoundException("course not found")
        }

        try {
        await this.prisma.courses.update(
                        {
                            where:{
                                id:id
                        },
                        data:{
                            name:payloud.name , 
                            description:payloud.description ,
                            prize:payloud.prize,
                            level:payloud.level,
                            banner: image ? Date.now() +"."+ image[0].mimetype.split("/")[1] : "null" ,
                            intro_video: video ? Date.now() +"."+ video[0].mimetype.split("/")[1] : null,
                        }
                    })

        return {
            success:true,
            message:"User updated successfully"
        }

        } catch (err) {
            if( err instanceof Error ) {
                throw new ConflictException("course already exists")
            }
        }
    }


    async deleteAssitantFromGroup(course_id:number , assistant_id:number) {
        const existsCourse = await this.prisma.courses.findUnique({where:{id:course_id , assistant_id:assistant_id}});

        if(!existsCourse) {
            throw new NotFoundException("course_id or assistant_id incorrect")
        }

        await this.prisma.courses.update({where:{id:course_id} , data:{assistant_id:null}});

        return {
            success:true,
            message:"assistant was successfully removed from this group"
        }
    }

    async findCourse(name:string) {
        const users = await this.prisma.courses.findMany({where:{name:{startsWith: name , mode:"insensitive"}},select:{
            id:true,
            name:true,
            sections:true,
            level:true,
            prize:true,
            category:true
        }});

        return {
            success:true,
            data:users
        }
    }
}