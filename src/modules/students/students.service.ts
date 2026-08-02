import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import hashing from "../../common/config/hash"
import { PatchStudentDto } from './dto/patch-student.dto';
import { ApiGatewayTimeoutResponse } from '@nestjs/swagger';

@Injectable()
export class StudentsService {
    constructor(private prisma:PrismaService){}

    async getAllStudents(page:number , limit:number) {
        const students = await this.prisma.users.findMany(
            {
                where:{
                    role:"STUDENT"
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
            data: students
        }
    }

    async getOneStudent(id:number) {
                const user = await this
                                    .prisma
                                    .users
                                    .findUnique(
                                     {
                                        where: { id:id , role:"STUDENT" } , 
                                        select: {
                                            id:true,
                                            full_name:true,
                                            phone_number:true,
                                            role:true,
                                            created_at:true
                                        }});
    
                if(!user) {
                    throw new NotFoundException("User with this id not found")
                }
    
                return {
                    success:true,
                    data: user
                }
            }
    
    async createStudentUser(payload:CreateStudentDto) {
        const user = await this.prisma.users.findUnique({where:{phone_number:payload.phone_number}});

        if(user) {
            throw new ConflictException("User with this phone_number already exists")
        }

        const hashedPassword = await hashing.HashingPassword(payload.password);
        await this.prisma.users.create(
            {
                data:{
                    full_name:payload.full_name,
                    phone_number:payload.phone_number,
                    password:hashedPassword,
                    role:"STUDENT"
                }
            })

        return {
            success:true,
            message:"User created successully"
        }
    }

    async findUserStudent(name:string) {
        const user = await this.
                            prisma.
                            users.
                            findFirst({where:{
                                            full_name:{
                                                startsWith:name , 
                                                mode:"insensitive"
                                            },
                                            role:"STUDENT"
                            } , select : {
                                id:true,
                                full_name:true,
                                phone_number:true,
                                role:true,
                                created_at:true
                            }});

        return {
            success:true,
            data: user
        }
    }

    async deletesUserStudent(id:number) {
        const existUser = await this.prisma.users.findUnique({where:{id:id , role:"STUDENT"}});
        
        if( !existUser ) {
            throw new NotFoundException("User with this id not found")
        }

        await this.prisma.users.delete({where:{id:id}});

        return {
            success:true,
            message:"User deleted successfully"
        }
    }

    async updateUserStudent(payloud:PatchStudentDto , id:number) {
        const existUser = await this.prisma.users.findFirst({where:{id:id , role:"STUDENT"}});
        
        if(!existUser) {
            throw new NotFoundException("User with this id not found")
        }

        try {
        await this.
                prisma.
                users.
                update(
                    {
                        where:{id:id} , 
                        data:{ 
                            full_name:payloud.full_name , 
                            phone_number:payloud.phone_number 
                    }})
        
        return {
            success:true,
            message:"User updated successfully"
        }
        } catch(err) {
            if (err instanceof Error) {
                throw new ConflictException("User with this phone_number already exists")
            }
        }
    }
}
