import { Headers, Controller, Post, UseGuards, Body } from '@nestjs/common';
import { UserRoles } from '@prisma/client';
import { JWTtoken } from 'src/common/config/jwt';
import { Roles } from 'src/common/decorators/role';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@Controller('auth')
export class AuthController {
    constructor( private jwtToken:JWTtoken ) {}
    
    @UseGuards(AuthGuard , RoleGuard)
    @Roles(UserRoles.SUPERADMIN)
    @Post('login')
    login(@Headers("authorization") authorization:string ) {
        const x = authorization.split(' ')[1]
        return {
            success:true,
            accessToken: this.jwtToken.verifyToken(x)
        }
    }

    @Post('register')
    register(@Body() payloud:any) {
        return {
            success:true,
            accessToken: this.jwtToken.accessToken(payloud)
        }
    }
} 