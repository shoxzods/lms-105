import { Headers, Controller, Post, UseGuards } from '@nestjs/common';
import { JWTtoken } from 'src/common/config/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
    constructor( private jwtToken:JWTtoken ) {}
    
    @UseGuards(AuthGuard)
    @Post('login')
    login(@Headers("authorization") authorization:string ) {
        const x = authorization.split(' ')[1]
        return {
            success:true,
            accessToken: this.jwtToken.verifyToken(x)
        }
    }
} 