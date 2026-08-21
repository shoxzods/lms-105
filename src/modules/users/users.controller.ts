import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly userService:UsersService) {}
    
    @ApiOperation({summary:UserRoles.SUPERADMIN})
    @Roles(UserRoles.SUPERADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("/all")
    async getAllUsers() {
        const message = await this.userService.getAllUsers();
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN} , ${UserRoles.TEACHER} , ${UserRoles.ASSISTANT} , ${UserRoles.STUDENT}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN , UserRoles.TEACHER , UserRoles.ASSISTANT , UserRoles.STUDENT)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("info")
    async getUserInfo(@Req() req:{user:{id:number}}) {
        const message = await this.userService.getUserInfo(req.user.id)

        return message
    }
}