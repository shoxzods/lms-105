import { Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { JWTtoken } from 'src/common/config/jwt';
import hashing from "../../common/config/hash"

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService , private jwt:JWTtoken){}
    async login(payloud:LoginDto) {
        const users = await this.prisma.users.findUnique({where:{phone_number:payloud.phone_number}})

        if(!users) {
            throw new NotFoundException("user with this phone_number or password not found")
        }

        const verify = await hashing.PasswordVerify(users.password , payloud.password);

        if(!verify) {
            throw new NotFoundException("user with this phone_number or password not found")
        }

        return {
            success:true,
            accessToken: this.jwt.accessToken({id:users?.id , email:users?.email , role:users?.role})
        }
    }
}