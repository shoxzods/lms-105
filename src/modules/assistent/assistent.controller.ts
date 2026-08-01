import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AssistentService } from './assistent.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { PatchAssistantDto } from './dto/patch-assistant.dto';

@ApiBearerAuth()
@Controller('assistent')
export class AssistentController {
    constructor( private readonly assistantService:AssistentService ){}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("one/:id")
    async getOneAssistant(@Param("id" , ParseIntPipe) id:number) {
        const message = await this.assistantService.getOneAssistant(id)
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllAssistants(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        const message = await this.assistantService.getAllAssistants( page , limit)
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createUserAssistant( @Body() payloud:CreateAssistantDto ) {
        const message = await this.assistantService.createUserAssistant(payloud)
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post('find')
    async findUsersAssistant(@Query("name") name:string){
        const message = await this.assistantService.findUsersAssistant(name);

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete('one/:id')
    async DeleteAssitantUser(@Param("id" , ParseIntPipe) id:number) {
        const message =  await this.assistantService.DeleteAssistantUser(id);

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Patch('one/:id')
    async PatchUserAssistant(@Body() payload:PatchAssistantDto , @Param("id" , ParseIntPipe) id:number) {
         const message = await this.assistantService.PatchUserAssistant(payload , id);
         return message
     }
}