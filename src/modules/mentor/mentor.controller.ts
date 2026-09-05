import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateMentorDto } from './dto/create_mentor.dto';
import { MentorService } from './mentor.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/role';
import { UserRoles } from '@prisma/client';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { PatchMentorDto } from './dto/patch-mentor.dto';
import { CreateAssistantDto } from './dto/create_assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dot';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiBearerAuth()
@Controller('mentor')
export class MentorController {
    constructor(private readonly mentorService:MentorService){}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllMentors(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
         const message = await this.mentorService.getAllMentors( page , limit)
         return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("one/:id")
    async getOneMentor(@Param("id" , ParseIntPipe) id:number) {
         const message = await this.mentorService.getOneMentor(id)
         return message
    }

    // teacher's assistants:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("me/assistants")
    async getTeacherAssitants(@Req() req:any , @Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        return await this.mentorService.getTeacherAssitants(req.user.id , page , limit)
    }

    // teacher's students:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("me/students")
    async getTeacherStudents(@Req() req:any , @Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number ) {
        return await this.mentorService.getTeacherStudents(req.user.id , page , limit)
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)    
    @Get('me/assistant/:id')
    async getTeacherOneAssistant(@Req() req:{user:{id:number}} , @Param("id" , ParseIntPipe) id:number) {
        return await this.mentorService.getTeacherOneAssistant(req.user.id , id)
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)    
    @Get('me/student/:id')
    async getTeacherOneStudent(@Req() req:{user:{id:number}} , @Param("id" , ParseIntPipe) id:number) {
        return await this.mentorService.getTeacherOneStudent(req.user.id , id)
    }

    // teacher's courses:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)    
    @Get('me/courses')
    async getTeachersCourses(@Req() req:{user:{id:number}} , @Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        return await this.mentorService.getTeachersCourses(req.user.id , page , limit)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createMentor(@Body() payloud:CreateMentorDto) {
        const message = await this.mentorService.createMentor(payloud);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post('find')
    async findUsersmentors(@Query("name") name:string){
        const message = await this.mentorService.findUsersMentors(name);

        return message
    }

    // teacher's assistants add:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("me/assistant")
    async createTeacherAssistant(@Req() req:{user:{id:number}} , @Body() payload:CreateAssistantDto) {
        return await this.mentorService.createTeacherAssistant( req.user.id , payload)
    }

    // teacher's assistants find:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("me/assistant/find")
    async findTeacherAssistants( @Req() req:{user:{id:number}} , @Query("name") name:string) {
        return await this.mentorService.findTeacherAssistants(req.user.id ,  name)
    }

    // teacher's sutend find:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("me/student/find")
    async findTeacherStudents( @Req() req:{user:{id:number}} , @Query("name") name:string) {
        return await this.mentorService.findTeacherStudents(req.user.id ,  name)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete('one/:id')
    
    async DeleteAdminUser(@Param("id" , ParseIntPipe) id:number) {
            const message =  await this.mentorService.DeleteMentorUser(id);
            return message
    }

    // teacher's assistants delete:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("me/assistant/:id")
    async deleteTeacherAssistant(@Req() req:{user:{id:number}} ,  @Param("id" , ParseIntPipe) id:number) {
        return await this.mentorService.deleteTeacherAssistant( req.user.id , id)
    }

    // teacher's student delete:
    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("me/student/:id")
    async deleteTeacherStudent(@Req() req:{user:{id:number}} ,  @Param("id" , ParseIntPipe) id:number) {
        return await this.mentorService.deleteTeacherStudent( req.user.id , id)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch('one/:id')
        async PatchUserAdmin(@Body() payload:PatchMentorDto , @Param("id" , ParseIntPipe) id:number) {
            return await this.mentorService.PatchUserMentor(payload , id);
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch('me/assistant/:id')
        async updateTeacherAssistant(@Req() req:{user:{id:number}} , @Body() payload:UpdateAssistantDto , @Param("id" , ParseIntPipe) id:number) {
            return await this.mentorService.updateTeacherAssistant(req.user.id , payload , id);
        }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch('me/student/:id')

    async updateTeacherStudent(@Req() req:{user:{id:number}} , @Body() payload:UpdateStudentDto , @Param("id" , ParseIntPipe) id:number) {
            return await this.mentorService.updateTeacherStudent(req.user.id , payload , id);
    }


    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("me/courses/find")
    async findTeacherCourse(@Req() req:{user:{id:number}} , @Query("name") name:string) {
        const message = await this.mentorService.findTeacherCourse(req.user.id , name)
        return message
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("me/course/:id")
    async deleteTeacherOneCourse(@Req() req:{user:{id:number}} , @Param("id") id:number) {
        return await this.mentorService.deleteTeacherOneCourse(req.user.id , id)
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("me/course/:id")
    async getTeacherOneCourse(@Req() req:{user:{id:number}} , @Param("id") id:number) {
        return await this.mentorService.getTeacherOneCourse(req.user.id , id)
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER) 
    @UseGuards(AuthGuard , RoleGuard)
    @Post("me/course/:courseId/assistant/:assistantId")
    async addAssistantToMentorCourse(@Req() req:{user:{id:number}} , @Param("courseId") courseId:number , @Param("assistantId") assistantId:number ) {
        return await this.mentorService.addAssistantToMentorCourse(req.user.id , courseId  , assistantId)
    }

    @ApiOperation({summary:UserRoles.TEACHER})
    @Roles(UserRoles.TEACHER)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("me/course/:courseId/assistant/:assistantId")
    async deleteAssistantToMentorCourse(@Req() req:{user:{id:number}} , @Param("courseId") courseId:number , @Param("assistantId") assistantId:number ) {
        return await this.mentorService.deleteAssistantToMentorCourse(req.user.id , courseId  , assistantId)
    }

//     @ApiOperation({summary:UserRoles.TEACHER})
//     @Roles(UserRoles.TEACHER)
//     @UseGuards(AuthGuard , RoleGuard)
//     @Post("me/course/:courseId/assistant/:assistantId")
//     async createMentorCourse(@Req() req:{user:{id:number}} , @Body() payload: ) {
//         return await this.mentorService.createMentorCourse(req.user.id , payload)
//     }
}