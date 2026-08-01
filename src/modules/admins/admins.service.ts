import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRoles } from '@prisma/client';
import hashing from "../../common/config/hash"
import { PatchAdminDto } from './dto/patch-admin.dto';

@Injectable()
export class AdminsService {
    constructor(private readonly prisma:PrismaService){}
    
    async getAllAdmins(page:number , limit:number) {

        const admins = await this.prisma.users.findMany(
            {
                where:{
                    role:"ADMIN"
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
            data:admins
        }
    }

    async createUserAdmin(payloud:CreateAdminDto) {
        const admins = await this.prisma.users.findUnique({where:{phone_number:payloud.phone_number}});

        if(admins) {
            throw new ConflictException("user wit this phone_number already exists")
        }
        const hashedPassword = await hashing.HashingPassword(payloud.password);
        await this.prisma.users.create({data:{full_name:payloud.full_name , phone_number:payloud.phone_number , role:UserRoles.ADMIN , password:hashedPassword}})
        
        return {
            success:true,
            message:"user created successfully"
        }
    }

    async findUsersAdmins(name:string) {
        const users = await this.prisma
                            .users
                            .findMany(
                                {
                                    where:{
                                        full_name:{
                                            startsWith:name , 
                                            mode:"insensitive"},
                                        role:"ADMIN"

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

    async DeleteAdminUser(id:number) {
        const user = await this.prisma.users.findUnique({where:{id:id}});

        if(!user) {
            throw new NotFoundException("User with this id not found")
        }

        await this.prisma.users.deleteMany({
            where: {
            id:id,
            role: UserRoles.ADMIN,
            },
        });

        return {
            success:true,
            message:"User deleted Successully"
        }
    }

    async PatchUserAdmin(payload:PatchAdminDto , id:number) {
    

        const hashedPassword = await hashing.HashingPassword(payload.password as string);

        try {

        const user = await this.prisma.users.updateManyAndReturn({where:{id:id , role:"ADMIN"} , 
                data:{
                    full_name:payload.full_name , 
                    phone_number:payload.phone_number , 
                    email:payload.email,
                    password:hashedPassword
                }})
        
        if(user.length == 0) {
            throw new NotFoundException("User with this id not found")
        }


        return {
            success:true,
            message:"user updated successfully"
        }
    } catch(err) {
        if(err instanceof Error) {
            throw new BadRequestException("User with this email or phone_number already exists")
        }
    }
    }

}
