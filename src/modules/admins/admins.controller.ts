import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { PatchAdminDto } from './dto/patch-admin.dto';

@ApiBearerAuth()
@Controller('admins')
export class AdminsController {
    constructor(private readonly adminService:AdminsService){}

    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllAdmins(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        const message = await this.adminService.getAllAdmins( page , limit)

        return message
    }

    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createUserAdmin( @Body() payloud:CreateAdminDto  ) {
        const message = await this.adminService.createUserAdmin(payloud)
        return message
    }

    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post('find')
    async findUsersAdmins(@Query("name") name:string){
        const message = await this.adminService.findUsersAdmins(name);

        return message
    }

    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete('one/:id')
    async DeleteAdminUser(@Param("id" , ParseIntPipe) id:number) {
        const message =  await this.adminService.DeleteAdminUser(id);

        return message
    }

    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @Patch('one/:id')
    async PatchUserAdmin(@Body() payload:PatchAdminDto , @Param("id" , ParseIntPipe) id:number) {
        const message = await this.adminService.PatchUserAdmin(payload , id);

        return message
    }
}