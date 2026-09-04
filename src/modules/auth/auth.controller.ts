import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ApiOperation } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { RegisterDto } from "./dto/register.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshDto } from "./dto/refresh.dto";

@Controller("auth") 
export class AuthController {
  constructor(private readonly authService: AuthService) {}
 
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @ApiOperation({ summary: "Login with phone and password" })
  login( @Req() req:{user:any} , @Body() payload: LoginDto) { 
    return this.authService.login(req,  payload);
  }

  @ApiOperation({ summary: "Register a new student account" })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post("register")
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @ApiOperation({ summary: "Verify OTP code sent via Telegram" })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("verify-otp")
  verifyOtp(@Body() payload: VerifyOtpDto) {
    return this.authService.verifyOtp(payload);
  }

  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post("refresh")
  refresh(@Body() payload: RefreshDto) {
    return this.authService.refresh(payload);
  }

  @ApiOperation({ summary: "Reset password using OTP code" })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("reset-password")
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }
}
