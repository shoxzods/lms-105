import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { UserRoles } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateSectionsDto } from './dto/create-section.dto';
import { UpdateSectionsDto } from './dto/update-section.dto';

@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionsService:SectionsService) {}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllSections(@Query("page" , ParseIntPipe) page:number  , @Query('limit') limit:number) {
        const  message = await this.sectionsService.getAllSections(page , limit);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post()
    async createSection(@Body() payload:CreateSectionsDto) {
        const message = await this.sectionsService.createSection(payload);
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("find")
    async findSection(@Query("name") name:string) {
        const message = await this.sectionsService.findSection(name)

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("one/:id")
    async deleteSection(@Param("id" , ParseIntPipe) id:number ) {
        const message = await this.sectionsService.deleteSection(id);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Patch("one/:id")
    async updateSection(@Param("id" , ParseIntPipe) id:number , @Body() payloud:UpdateSectionsDto) {
        const message = await this.sectionsService.updateSection(id , payloud)
        return message
    }

}
