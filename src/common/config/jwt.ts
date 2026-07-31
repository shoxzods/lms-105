import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JWTtoken {
    constructor(private jwt:JwtService) {}

    accessToken(payloud:object) {
        return this.jwt.sign(payloud, {
                secret: process.env.SECRET_KEY,
                expiresIn: "5m",
               });
    }

    verifyToken(token:string) {
        return this.jwt.verify(token , {secret:process.env.SECRET_KEY})
    }
}