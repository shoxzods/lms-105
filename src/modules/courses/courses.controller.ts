import { BadRequestException, Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesService } from './courses.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRoles } from '@prisma/client';
import { FileFieldsInterceptor} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
    constructor(private readonly courseService:CoursesService){}

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
    ]    , {
        storage:diskStorage({
            destination:(req , file , cb) => 
               file.fieldname == "banner" ? cb(null , join(process.cwd() , "src" , "uploads" , "images"))
                                            :cb(null , join(process.cwd() , "src" , "uploads" , "videos")),
            filename:(req , file , cb) => 
                cb(null , Date.now() + "." + file.mimetype.split("/")[1])
        }),
        fileFilter:(req , file , cb) => {
            if(file.fieldname == "banner") {
                const imgTypes = ["svg" , "png" , "jpg" , "gif"];

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

    @Post()
    createCourse(@Body() payloud:CreateCourseDto , @UploadedFiles() files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]}) {
        const message =  this.courseService.createCourse(payloud , files);
        return message 
    }

}