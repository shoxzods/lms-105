import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesService } from './courses.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/role';
import { UserRoles } from '@prisma/client';
import { FileFieldsInterceptor} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
    constructor(private readonly courseService:CoursesService){}

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get()
    async getAllCourses(@Query("page" , ParseIntPipe) page:number , @Query("limit" , ParseIntPipe) limit:number) {
        const message = await this.courseService.getAllCourses(page , limit)

        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Get("one/:id")
    async getOneCourse(@Param("id") id:number) {
        const message = await this.courseService.getOneCourse(id)
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("/:course_id/assistent/:assistent_id")
    async addAssistentToCourse(@Param("course_id" , ParseIntPipe) course_id:number , @Param("assistent_id" , ParseIntPipe) assistent_id:number) {
        const message = await this.courseService.addAssistentToCourse( course_id , assistent_id );
        
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("/:course_id/mentor/:mentor_id")
    async addMentorToCourse(@Param("course_id" , ParseIntPipe) course_id:number , @Param("mentor_id" , ParseIntPipe) mentor_id:number) {
        return await this.courseService.addMentorToCourse( course_id , mentor_id )
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data") 
    @ApiBody({
        schema:{
            type:"object",
            properties:{
                name:{type:"string"},
                description:{type:"string"},
                prize:{type:"number"},
                banner:{type:"string" , format:"binary"},
                intro_video:{type:"string" , format:"binary" , nullable:true},
                categoryId:{type:"number"},
                level:{type:"string" , enum:[ "BEGINNER" ,  "ELEMENTARY" , "PRE_INTERMIDIATE" , "INTERMIDIATE"]},
            },
            required: [
                "name" , 
                "description" , 
                "prize" , 
                "banner" , 
                "level"
            ]
        }
    })

    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @UseInterceptors(FileFieldsInterceptor([
        {name:"banner" , maxCount:1},
        {name:"intro_video" , maxCount:1}
    ], 
    {
        storage:diskStorage({
            destination:(req , file , cb) => 
               file.fieldname == "banner" ? cb(null , join(process.cwd() , "src" , "uploads" , "images"))
                                            :cb(null , join(process.cwd() , "src" , "uploads" , "videos")),
            filename:(req , file , cb) => 
                cb(null , Date.now() + "." + file.mimetype.split("/")[1])
        }),
        fileFilter:(req , file , cb) => {
            if(file.fieldname == "banner") {
                const imgTypes = ["svg" , "png" , "jpeg" , "gif"];

                if( !imgTypes.includes(file.mimetype.split('/')[1]) )
                    return cb(new BadRequestException("only (svg , png , jpg and gif) formats permited") , false)
            }

            if ( file.fieldname == "intro_video" ) {
                if(file.mimetype.split("/")[1] != "mp4" )
                    return cb(new BadRequestException("only mp4 permitted") , false)
            }

            cb(null , true)

        }

        }
    ))
 
    @Post()
    createCourse(@Body() payloud:CreateCourseDto , @UploadedFiles() files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]}) {
        const message =  this.courseService.createCourse(payloud , files);
        return message 
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Post("find")
    async findCourse(@Query("name") name:string) {
        const message = await this.courseService.findCourse(name)
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("one/:id")
    async deleteOneCourse(@Param("id" , ParseIntPipe ) id:number) {
        const message = await this.courseService.deleteOneCourse(id);
        return message
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("/:course_id/assistant/:assistant_id")
    async deleteAssitantFromGroup(@Param("course_id" , ParseIntPipe) course_id:number , @Param("assistant_id" , ParseIntPipe) assistant_id:number ) {
        const message = await this.courseService.deleteAssitantFromGroup(course_id , assistant_id);
        return message
    }

    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @Delete("/:course_id/mentor/:mentor_id")
    async deleteMentorFromGroup(@Param("course_id" , ParseIntPipe)  course_id:number , @Param("mentor_id" , ParseIntPipe) mentor_id:number ) {
        return await this.courseService.deleteMentorFromGroup(course_id , mentor_id)
    }


    @ApiOperation({summary:`${UserRoles.SUPERADMIN} , ${UserRoles.ADMIN}`})
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema:{
            type:"object",
            properties:{
                name:{type:"string"},
                description:{type:"string"},
                prize:{type:"number"},
                banner:{type:"string" , format:"binary"},
                intro_video:{type:"string" , format:"binary" , nullable:true},
                level:{type:"string" , enum:[ "BEGINNER" ,  "ELEMENTARY" , "PRE_INTERMIDIATE" , "INTERMIDIATE"]},
                categoryId:{type:"number"}
            }
        }
    })

    @Roles(UserRoles.SUPERADMIN , UserRoles.ADMIN)
    @UseGuards(AuthGuard , RoleGuard)
    @UseInterceptors(FileFieldsInterceptor([
        {name:"banner" , maxCount:1},
        {name:"intro_video" , maxCount:1}
    ], 
    {
        storage:diskStorage({
            destination:(req , file , cb) => 
               file.fieldname == "banner" ? cb(null , join(process.cwd() , "src" , "uploads" , "images"))
                                            :cb(null , join(process.cwd() , "src" , "uploads" , "videos")),
            filename:(req , file , cb) => 
                cb(null , Date.now() + "." + file.mimetype.split("/")[1])
        }),
        fileFilter:(req , file , cb) => {
            if(file.fieldname == "banner") {
                const imgTypes = ["svg" , "png" , "jpeg" , "gif"];

                console.log(imgTypes.includes(file.mimetype.split('/')[1]));

                if( !imgTypes.includes(file.mimetype.split('/')[1]) ) {
                    return cb(new BadRequestException("only (svg , png , jpg and gif) formats permited") , false)
                }
            }

            if ( file.fieldname == "intro_video" ) {
                if(file.mimetype.split("/")[1] != "mp4" ) {
                    return cb(new BadRequestException("only mp4 permitted") , false)
                }
            }

            cb(null , true)

        }

        }
    ))
    @Patch("one/:id")
    async updateCourse(@Body() payloud:UpdateCourseDto , @UploadedFiles() files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]} ,  @Param("id" , ParseIntPipe) id:number) {
        const message = await this.courseService.updateCourse(payloud , files , id);
        return message
    }
}