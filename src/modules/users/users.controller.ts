import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
