import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}
    @Post('login')
    async login(@Body() payloud:LoginDto) {
        const message = await this.authService.login(payloud);

        return message 
    }
} 