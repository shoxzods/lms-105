import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../core/database/prisma.service';
import { JWTtoken } from '../../common/config/jwt';
import hashing from "../../common/config/hash";
import { RegisterDto } from './dto/register.dto';
import { UserRoles } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JWTtoken
    ) {}

    async login(payload: LoginDto) {

        const users = await this.prisma.users.findUnique({
            where: {
                phone_number: payload.phone_number
            }
        });

        if (!users) {
            throw new NotFoundException(
                "user with this phone_number or password not found"
            );
        }

        const verify = await hashing.PasswordVerify(
            users.password,       // hash из базы
            payload.password      // пароль от пользователя
        );

        
        if (!verify) {
            throw new NotFoundException(
                "user with this phone_number or password not found"
            );
        }

        return {
            success: true,
            accessToken: this.jwt.accessToken({
                id: users.id,
                email: users.email,
                role: users.role
            })
        }
    }

    async register(payload:RegisterDto) {
        const users = await this.prisma.users.findUnique({where:{phone_number:payload.phone_number}});

        if(users)
            throw new ConflictException("user with this phone number already exists")

        if(payload.password !== payload.confirm_password)
            throw new BadRequestException("password does not match with confirm_password")

        const newUser = await this
                .prisma
                .users
                .create({
                    data: {
                        full_name:payload.full_name,
                        phone_number:payload.phone_number,
                        password: await hashing.HashingPassword(payload.password),
                        role:UserRoles.STUDENT
                    }
                })

        return {
            success:true,
            accessToken: this.jwt.accessToken({
                id:newUser.id,
                email:newUser.email,
                role:newUser.role  
            })
    }
}
}