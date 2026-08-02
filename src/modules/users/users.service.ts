import { Injectable, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/core/database/prisma.service';

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
        

        const data = users.reduce((acc:{role:string , count:number}[] , user) => {
            acc.push({role:user.role , count:user._count.id})

            return acc
        } , []);

        return {
            success:true,
            data:data
        }
    }
}
