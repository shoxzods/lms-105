import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { Roles } from '../../common/decorators/role';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonMaterialDto } from './dto/create-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-material.dto';
import { File } from 'buffer';
// import { format } from 'url';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonService:LessonsService) {}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Get()
    async getAllLessons(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        const message = await this.lessonService.getAllLessons(page , limit );

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Get('materials')
    async getAllLessonMaterials() {
        return await this.lessonService.getAllLessonMaterials()
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Get('materials/one/:id')
    async getOneLessonMaterial(@Param("id" , ParseIntPipe) id:number) {
        return await this.lessonService.getOneLessonMaterial(id)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data")
    @ApiBody({schema:{
        type:"object",
        properties: {
            name:{type:"string"},
            description:{type:"string"},
            sectionId:{type:"integer"},
            video_file:{type:"string" , format:"binary"}
        },required:["name" , "sectionId" , "description"]
    }})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseInterceptors(FileInterceptor("video_file" , {
        storage: diskStorage({
            destination: join(process.cwd() , "src" , "uploads" , "videos"),
            filename:( req , file , cb ) => {
                cb(null , Date.now() + "." + file.mimetype.split("/")[1])
            }
        }),
        fileFilter: ( req , file , cb ) => {
            const videoFormats = ["mp4" , "mov"];

            if(!videoFormats.includes(file.mimetype.split("/")[1])) {
                return cb(new BadRequestException("only mp4 and mov formats permited") , false)
            }

            cb(null , true)
        }
    }))
    @Post()
    async createLesson(@Body() payload:CreateLessonDto , @UploadedFile() file:Express.Multer.File) {
        const message = await this.lessonService.createLesson(payload , file);
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema:{
            type:"object",
            properties:{
                lessonId:{type:"integer"},
                files:{ 
                        type:"array" , 
                        items: { 
                            type:"string" , 
                            format:"binary" 
                        }},
                description:{type:"string"}
            },
            required: [
                "lessonId",
                "description"
            ]
        }
    })
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @UseInterceptors(FilesInterceptor('files' , 10 , {
        storage:diskStorage({
            destination:join(process.cwd() , "src" , "uploads" , "images"),
            filename:(_ , file , cb) => cb(null , Date.now() + "." + file.mimetype.split('/')[1]) 
        }),
        fileFilter:(_ , file , cb) => {
                const imgTypes = ["svg" , "png" , "jpeg" , "gif"];

                if( !imgTypes.includes(file.mimetype.split('/')[1]) )
                    return cb(new BadRequestException("only (svg , png , jpg and gif) formats permited") , false)
                
                cb(null , true)
        }
    }))
    @Post("materials")
    async createLessonMaterial(@Body() payloud:CreateLessonMaterialDto , @UploadedFiles() files:Express.Multer.File[]) {
        return  await this.lessonService.createLessonMaterial(payloud , files)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Delete("one/:id")
    async deleteLesson(@Param("id" , ParseIntPipe) id:number) {
        const message = await this.lessonService.deleteLesson(id);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @Delete("material/one/:id")
    async deleteLessonMaterial(@Param("id" , ParseIntPipe) id:number) {
        return await this.lessonService.deleteLessonMaterial(id)
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data")
    @ApiBody({schema:{
        type:"object",
        properties: {
            name:{type:"string"},
            description:{type:"string"},
            sectionId:{type:"integer"},
            video_file:{type:"string" , format:"binary"}
        }
    }})

    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseInterceptors(FileInterceptor("video_file" , {
        storage: diskStorage({
            destination: join(process.cwd() , "src" , "uploads" , "videos"),
            filename:( req , file , cb ) => {
                cb(null , Date.now() + "." + file.mimetype.split("/")[1])
            }
        }),
        fileFilter: ( req , file , cb ) => {
            const videoFormats = ["mp4" , "quicktime"];

            if(!videoFormats.includes(file.mimetype.split("/")[1])) {
                return cb(new BadRequestException("only mp4 and mov formats permited") , false)
            }

            cb(null , true)
        }
    }))
    @Patch("one/:id")
    async updateLesson( @Body() payload:UpdateLessonDto ,  @Param("id" , ParseIntPipe) id:number , @UploadedFile() file:Express.Multer.File) {
        const message = await this.lessonService.updateLesson( payload , file , id);
        return message
    }




// update lessonMaterial
    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema:{
            type:"object",
            properties:{
                lessonId:{type:"integer"},
                files:{ 
                        type:"array" , 
                        items: { 
                            type:"string" , 
                            format:"binary" 
                        }},
                description:{type:"string"}
            }
        }
    })
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @UseInterceptors(FilesInterceptor('files' , 10 , {
        storage:diskStorage({
            destination:join(process.cwd() , "src" , "uploads" , "images"),
            filename:(_ , file , cb) => cb(null , Date.now() + "." + file.mimetype.split('/')[1]) 
        }),
        fileFilter:(_ , file , cb) => {
                const imgTypes = ["svg" , "png" , "jpeg" , "gif"];

                if( !imgTypes.includes(file.mimetype.split('/')[1]) )
                    return cb(new BadRequestException("only (svg , png , jpg and gif) formats permited") , false)
                
                cb(null , true)
        }
    }))
    @Patch('material/one/:id')
    async updateLessonMaterial(@Param("id" , ParseIntPipe) id:number , @Body() payloud:UpdateLessonMaterialDto , @UploadedFiles() files:Express.Multer.File[]) {
        return await this.lessonService.updateLessonMaterial(payloud, id , files)
    }

}