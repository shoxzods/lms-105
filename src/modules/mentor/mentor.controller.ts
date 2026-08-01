import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateMentorDto } from './dto/create_mentor.dto';
import { MentorService } from './mentor.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role';
import { UserRoles } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { PatchMentorDto } from './dto/patch-mentor.dto';

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
    async findUsersAdmins(@Query("name") name:string){
        const message = await this.mentorService.findUsersMentors(name);

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete('one/:id')
    
    async DeleteAdminUser(@Param("id" , ParseIntPipe) id:number) {
            const message =  await this.mentorService.DeleteMentorUser(id);
    
            return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Roles(UserRoles.SUPERADMIN)
    @Patch('one/:id')
        async PatchUserAdmin(@Body() payload:PatchMentorDto , @Param("id" , ParseIntPipe) id:number) {
            const message = await this.mentorService.PatchUserMentor(payload , id);
    
            return message
    }

}
