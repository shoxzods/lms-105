import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    @Post('login')
    async login(@Body() payloud:LoginDto) {
        const message = await this.authService.login(payloud);

        return message 
    }

    @Post("register")
    async register(@Body() payloud:RegisterDto) {
        return await this.authService.register(payloud)
    }
} 