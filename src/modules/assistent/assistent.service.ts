import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import hashing from "../../common/config/hash"
import { PatchAssistantDto } from './dto/patch-assistant.dto';

@Injectable()
export class AssistentService {
    constructor(private readonly prisma:PrismaService){}

        async getOneAssistant(id:number) {
            const user = await this
                                .prisma
                                .users
                                .findUnique(
                                 {
                                    where: { id:id , role:"ASSISTANT" } , 
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

       async getAllAssistants(page:number , limit:number) {

        const assistants = await this.prisma.users.findMany(
            {
                where:{
                    role:"ASSISTANT"
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
            data:assistants
        }
    }


    async createUserAssistant(payloud:CreateAssistantDto) {
       try {

        const hashedPassword = await hashing.HashingPassword(payloud.password);

        await this.prisma.users.create({data:{ full_name:payloud.full_name , phone_number:payloud.phone_number , password:hashedPassword, role:"ASSISTANT" }})
        
        return {
            success:true,
            message:"User created successfully"
        }

        } catch(err) {
            if(err instanceof Error) {
               throw new ConflictException("User with this phone_number already exists")
            }
        }
    }

    async findUsersAssistant(name:string) {
        const users = await this.prisma
                            .users
                            .findMany(
                                {
                                    where:{
                                        full_name:{
                                            startsWith:name , 
                                            mode:"insensitive"
                                        },
                                        role:"ASSISTANT"
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


    async DeleteAssistantUser(id:number) {
        const user = await this.prisma.users.findUnique({where:{id:id}});

        if(!user) {
            throw new NotFoundException("User with this id not found")
        }

        await this.prisma.users.delete({
            where: {
                id:id,
            },
        });

        return {
            success:true,
            message:"User deleted Successully"
        }
    }


     async PatchUserAssistant(payload:PatchAssistantDto , id:number) {
            const hashedPassword = await hashing.HashingPassword(payload.password as string);

            try {
            const user = await this.prisma.users.findFirst({where:{id:id}});

            if(!user) {
                throw new NotFoundException("User with this id not found")
            }

            await this.prisma.users.update(
                {
                    where:{
                        id:id , 
                        role:"ASSISTANT"
                    }, 
                    data:{
                        email:payload.email,
                        full_name:payload.full_name,
                        password:hashedPassword,
                        phone_number:payload.phone_number
                    }
                },
                
            )
           
            return {
                success:true,
                message:"User updated successully"
            }
            } catch (err) {
                if( err instanceof Error ) {
                   throw new ConflictException("User with this email or phone_number already exists")
                }
            }
        }
    
}