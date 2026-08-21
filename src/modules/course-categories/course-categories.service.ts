import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';

@Injectable()
export class CourseCategoriesService {
    constructor(private prisma:PrismaService) {}
    async createCourseCategory(payloud:CreateCourseCategoryDto) {
        try {
            await this.prisma.categories.create({data:{name:payloud.name}});

            return {
                success:true,
                message:"course category created successfully"
            }
        } catch ( err ) {
            if(err instanceof Error) {
             throw new ConflictException("course category already exists")
            }
        }
    }

    async deleteCourseCategory(id:number) {
        const existCourseCategory = await this.prisma.categories.findUnique({where:{id:id}});

        if(!existCourseCategory) {
            throw new NotFoundException("course category not found")
        }

        await this.prisma.categories.delete({where:{id:id}})

        return {
            success:true,
            message:"course category deleted successfully"
        }
    }
    
    async updateCourseCategory(payload:UpdateCourseCategoryDto , id:number) {
        const existCourseCategory = await this.prisma.categories.findUnique({where:{id:id}});

        if(!existCourseCategory) {
            throw new NotFoundException("course category not found")
        }

        try {
            await this.prisma.categories.update({where:{id:id} , data:{name:payload.name}});

            return {
                success:true,
                message:"course category updated successfully"
            }
        } catch(err) {
            if(err instanceof Error) {
                throw new ConflictException("course category with this name already exists")
            }
        }
    }

    async getAllCourseCategories(page:number , limit:number) {
        const courseCategories = await this.prisma.categories.findMany( 
            {   
                take:limit,
                skip:limit*(page - 1)
            });

        return {
            success:true,
            data:courseCategories
        }
    }

    async findCourseCategory(name:string) {
        const courseCategory = await this.prisma.categories.findMany({where:{name:{startsWith:name , mode:"insensitive"}}});

        return {
            success:true,
            data: courseCategory
        }
    }
}
