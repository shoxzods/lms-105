import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRoles } from '@prisma/client';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';

@ApiBearerAuth()
@Controller('course-categories')
export class CourseCategoriesController {
    constructor(private readonly courseCategory:CourseCategoriesService) {}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllCourseCategories(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number ) {
        const message = await this.courseCategory.getAllCourseCategories(page , limit);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createCourseCategory(@Body() payloud:CreateCourseCategoryDto ) {
        const message = await this.courseCategory.createCourseCategory(payloud);
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("find")
    async findCourseCategory(@Query("name") name:string) {
        const message = await this.courseCategory.findCourseCategory(name);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("one/:id")
    async deleteCourseCategory(@Param("id" , ParseIntPipe) id:number) {
        const message = await this.courseCategory.deleteCourseCategory(id);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch("one/:id")
    async updateCourseCategory(@Body() payload:UpdateCourseCategoryDto , @Param("id" , ParseIntPipe) id:number) {
        const message = await this.courseCategory.updateCourseCategory(payload , id)

        return message
    } 
}