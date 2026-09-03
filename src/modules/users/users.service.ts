import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../core/database/prisma.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import hashing from "../../common/config/hash"

@ApiBearerAuth()
@Injectable()
export class UsersService {
    constructor(private prisma:PrismaService) {}

    async getAllUsers() {
        const users = await this.
                            prisma.
                            users.
                            groupBy(
                                {
                                    by:["role"],
                                    where:{
                                        role:{
                                            in:["ADMIN" , "TEACHER" , "ASSISTANT" ,"STUDENT"]
                                        },
                                    },
                                    _count:{
                                        id:true
                                    }
                                });

        const courses = await this.prisma.courses.count();

        const data = users.reduce((acc:{role:string , count:number}[] , user) => {
            acc.push({role:user.role , count:user._count.id})

            return acc
        } , []);

        return {
            success:true,
            data: 
            {
                users:data,
                courses:courses
            }
        }
    }

    async getUserInfo(id:number) {
        const user = await this.prisma.users.findUnique(
            {
                where:{id:id} , 
                select:{
                    id:true,
                    full_name:true,
                    phone_number:true,
                    email:true,
                    created_at:true,
                    updated_at:true,
                } 
            })
    
        return {
            success:true,
            data:user
        }
    }

    async changeUserPassword( payloud:UpdatePasswordDto , id:number) {
        const hashedPassword = await this.prisma.users.findUnique({where:{id} , select:{password:true}})
        const checkCurrentPassword = await hashing.PasswordVerify(hashedPassword!.password , payloud.current_password)

        if(!checkCurrentPassword)
            throw new BadRequestException("current password is not correct")

        if(payloud.new_password !== payloud.confirm_password)
            throw new BadRequestException("new_password does not match confirm password")

        const newPassword = await hashing.HashingPassword(payloud.confirm_password);

        await this.prisma.users.update({where:{id} , data:{password:newPassword}})

        return {
            success:true,
            message:"user password changed successfully"
        }
    }
}