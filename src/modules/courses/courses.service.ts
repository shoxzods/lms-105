import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class CoursesService {
    constructor(private prisma:PrismaService){}
    async createCourse(payloud:CreateCourseDto , files:{banner?:Express.Multer.File[] , intro_video?: Express.Multer.File[]}) {
        const video = files.intro_video;
        const image = files.banner;

        if ( video && video[0].size > 5 * 1024 * 1024)
            throw new BadRequestException("intro_video size must be less than 1.4MB")
        
        const existsCourse = await this.prisma.courses.findUnique({where:{name:payloud.name}});

        if( existsCourse ) 
            throw new ConflictException("coursr already exists")
        
        await this.prisma.courses.create(
            {
                data:{
                    name:payloud.name , 
                    description:payloud.description ,
                    prize:payloud.prize,
                    level:payloud.level,
                    banner: image ? Date.now() +"."+ image[0].mimetype.split("/")[1] : "null" ,
                    intro_video: video ? Date.now() +"."+ video[0].mimetype.split("/")[1] : null,
                }
            });
                
        return {
            success:true,
            message:"Course created successfully"
        }
    }
}
