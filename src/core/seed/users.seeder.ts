import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { UserRoles } from "@prisma/client";

@Injectable()
export class UserSeeder implements OnModuleInit {
    constructor(private prisma:PrismaService){}

    async onModuleInit() {
        const existUser = await this.prisma.users.findUnique({where:{phone_number:"+998995507613"}});

        if(existUser) {
            return Logger.log("✅ Superadmin already exists")
        }

        await this.prisma.users.create(
            {
              data: {
                full_name:"Shoxzod Primov",
                phone_number:"+998995507613",
                email:"ranaldu456@gmail.com",
                password:process.env.USER_PASSWORD as string,
                role:UserRoles.SUPERADMIN 
              }
            }
        )

        Logger.log("✅ Superadmin created successfully")
    }

}