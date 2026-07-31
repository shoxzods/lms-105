import { Body, Controller, Post } from '@nestjs/common';
import { JWTtoken } from 'src/common/config/jwt';

@Controller('auth')
export class AuthController {
    constructor( private jwtToken:JWTtoken ) {}
    @Post('login')
    login(@Body() payloud:any) {
        return {
            success:true,
            accessToken: this.jwtToken.accessToken(payloud)
        }
    }
} 