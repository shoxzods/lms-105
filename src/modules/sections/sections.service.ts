import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateSectionsDto } from './dto/create-section.dto';
import { UpdateSectionsDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
    constructor(private prisma:PrismaService) {}
    async getAllSections(page:number , limit:number) {
        const sections = await this.prisma.section.findMany({take:limit , skip:limit*(page -1) })

        return {
            success:true,
            data:sections
        }
    }

    async createSection(payload:CreateSectionsDto) {
        const existCourse = await this.prisma.courses.findUnique({where:{id:payload.courseId}});
        
        if(!existCourse) {
            throw new NotFoundException("course not found")
        }
        
        const existUnique = await this.prisma.section.findFirst({   
        where: {
            name: payload.name,
            course_id: payload.courseId
        }});

        if(existUnique) {
            throw new ConflictException("A section with this name already exists in this course")
        }

        await this.prisma.section.create({data:{name:payload.name , course_id:payload.courseId}});
        
        return {
            success:true,
            message:"Section created successfully"
        }
    }

    async findSection(name:string) {
        const sections = await this.prisma.section.findMany({where:{name:{startsWith:name , mode:"insensitive"}}});

        return {
            success:true,
            data: sections
        }
    }

    async deleteSection(id:number) {
        const existSection = await this.prisma.section.findUnique({where:{id:id}});

        if( !existSection ) {
            throw new NotFoundException("section not found")
        }

        return {
            success:true,
            message:"section deleted successfully"
        }
    }

    async updateSection(id:number , payload:UpdateSectionsDto) {
        const existSection = await this.prisma.section.findUnique({where:{id:id}});

        if(!existSection) {
            throw new NotFoundException("section not found")
        }

        const existCourse = await this.prisma.courses.findUnique({where:{id:payload.courseId ? payload.courseId : existSection.course_id}});

        if(!existCourse) {
            throw new NotFoundException("course not found")
        }

        const existUnique = await this.prisma.section.findFirst({   
        where: {
            name: payload.name ? payload.name : existSection.name,
            course_id: payload.courseId ? payload.courseId : existSection.course_id
        }});

        console.log(existUnique);

        if(existUnique) {
            throw new ConflictException("A section with this name already exists in this course")
        }

        await this.prisma.section.update({where:{id:id}, data:{name:payload.name ? payload.name : existCourse.name , course_id: payload.courseId ? payload.courseId : existSection.course_id}});

        return {
            success:true,
            message:"section updated succesffully"
        }
    }
}