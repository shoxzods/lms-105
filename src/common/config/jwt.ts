import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";

interface JwtPayload {
  id: number;
  role: UserRole;
  full_name: string;
}

@Injectable()
export class JwtToken {
  constructor(private jwtService: JwtService) {}

  jwtAccessToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: "30m",
    });
  }

  verify(token: string) {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: process.env.SECRET_KEY,
    });
  }

  jwtRefreshToken(payload: JwtPayload) {
    return this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: "30d",
    });
  }
}
