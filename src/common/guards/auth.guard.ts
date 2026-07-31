import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JWTtoken } from "../config/jwt";

export class AuthGuard implements CanActivate {
    constructor( private jwtToken:JWTtoken ) {}
    canActivate(context: ExecutionContext): boolean  {
        try {
            const req = context.switchToHttp().getRequest();
            const token:string = req.headers.authorization;

            if(!token) {
                throw new UnauthorizedException()
            }

            const user = this.jwtToken.verifyToken(token.split(" ")[1]);
            req.user = user;

            return true
        } catch(err) {
            
            if(err instanceof Error) {
                console.log(err.name)
            }

            return false
        }
    }
}