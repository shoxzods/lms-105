import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { PatchStudentDto } from './dto/patch-student.dto';

@ApiBearerAuth()
@Controller('students')
export class StudentsController {
    constructor(private readonly studentService:StudentsService){}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllStudents(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        const message = await this.studentService.getAllStudents(page , limit)
    
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("one/:id")
    async getOneStudent(@Param("id" , ParseIntPipe) id:number) {
        const message = await this.studentService.getOneStudent(id)
        return message
    }
    

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createStudentUser(@Body() payload:CreateStudentDto) {
        const message = await this.studentService.createStudentUser(payload);

        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("find")
    async findUserStudent(@Query("name") name:string) {
        const message = await this.studentService.findUserStudent(name)

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("one/:id")
    async deletesUserStudent(@Param("id" , ParseIntPipe) id:number) {
        const message = await this.studentService.deletesUserStudent(id);
        
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch("one/:id")
    async updateUserStudent(@Body() payloud:PatchStudentDto , @Param("id" , ParseIntPipe) id:number) {
        const message = await this.studentService.updateUserStudent(payloud , id)

        return message
    }
}
