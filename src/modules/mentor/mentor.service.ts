import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateMentorDto } from './dto/create_mentor.dto';
import hashing from "../../common/config/hash"
import { PatchMentorDto } from './dto/patch-mentor.dto';

@Injectable()
export class MentorService {
    constructor(private prisma:PrismaService){}

    async getAllMentors(page:number , limit:number) {

        const teachers = await this.prisma.users.findMany(
            {
                where:{
                    role:"TEACHER"
                },
                select:{
                    id:true,
                    full_name:true,
                    phone_number:true,
                    role:true,
                    created_at:true,
                },
                take:limit,
                skip:limit*(page - 1)
            });
            
        return {
            success:true,
            data:teachers
        }
    }


    async getOneMentor(id:number) {
        const mentor = await this.prisma.users.findFirst(
            {
                where:{
                    id:id , 
                    role:"TEACHER"
                },
                select:{
                    id:true,
                    full_name:true,
                    role:true,
                }});
        
        const mentorInfo = await this.prisma.mentorProfile.findFirst({
            where:{
                user_id:id
            },
            select:{
                id:true,
                job:true,
                experience:true,
                description:true,
                courses:true,
                github:true,
                instagram:true,
                linkedIn:true,
                facebook:true,
                telegram:true,
                web_link:true,
            }
        });


        return {
            success:true,
            data:{
                ...mentor,
                userInfo:mentorInfo
            }
        }
    }


    async createMentor(payloud:CreateMentorDto) {
        const hashedPassword = await hashing.HashingPassword(payloud.password)

        try {
        const mentor = await this.
                        prisma.users.
                        createManyAndReturn(
                            {
                                data:{
                                    full_name:payloud.full_name,
                                    phone_number:payloud.phone_number,
                                    password:hashedPassword,
                                    role:"TEACHER"
                                }
                            });

        await this.prisma.mentorProfile.create({
            data:{
                user_id:mentor[0].id,
                experience:payloud.experience,
                job:payloud.job,
                web_link:payloud.web_link,
                description:payloud.description,
                facebook:payloud.facebook,
                telegram:payloud.telegram,
                linkedIn:payloud.linkedIn,
                instagram:payloud.instagram,
                github:payloud.github
            }
        })

        return {
            success:true,
            message:"User created Successfully"
        }
        } catch( err ) {
            if ( err instanceof Error ) {
                throw new BadRequestException("User with this phone_number already exists")
            }
        } 
    }

       async findUsersMentors(name:string) {
        const users = await this.prisma
                            .users
                            .findMany(
                                {
                                    where:{
                                        full_name:{
                                            startsWith:name , 
                                            mode:"insensitive"},
                                        role:"TEACHER"
                                    },
                                    select:{
                                        id:true,
                                        full_name:true,
                                        phone_number:true,
                                        role:true,
                                        created_at:true,
                                    }
                                })

        return {
            success:true,
            data:users
        }
    }


    async DeleteMentorUser(id:number) {
            const user = await this.prisma.users.findUnique({where:{id:id}});

            if(!user) {
                throw new NotFoundException("User with this id not found")
            }
            
            await this.prisma.mentorProfile.deleteMany({where:{user_id:user.id}});

            await this.prisma.users.deleteMany({
                where: {
                    id:id,
                    role: "TEACHER",
                },
            });
    
            return {
                success:true,
                message:"User deleted Successully"
            }
        }

    async PatchUserMentor(payloud:PatchMentorDto , id:number) {
        
        const hashedPassword = await hashing.HashingPassword(payloud.password);

        try {
        await this.
                        prisma.users.
                        update(
                            {
                                where:{
                                    id:id
                                },

                                data:{
                                    full_name:payloud.full_name,
                                    phone_number:payloud.phone_number,
                                    password:hashedPassword,
                                    role:"TEACHER"
                                }
                            });

        await this.prisma.mentorProfile.updateMany({
            where:{
                user_id:id
            },
            data:{
                experience:payloud.experience,
                job:payloud.job,
                web_link:payloud.web_link,
                description:payloud.description,
                facebook:payloud.facebook,
                telegram:payloud.telegram,
                linkedIn:payloud.linkedIn,
                instagram:payloud.instagram,
                github:payloud.github
            }
        })

        return {
            success:true,
            message:"User updated successully"
        }
    } catch(err) {
        if(err instanceof Error) {
            throw new BadRequestException("User with this phone_number already exists")
        }
    }

    }

 
    
}