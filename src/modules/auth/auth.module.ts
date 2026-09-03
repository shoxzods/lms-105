import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtToken } from "src/common/config/jwt";

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtToken],
})
export class AuthModule {}
