import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JWTtoken } from "../config/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtToken: JWTtoken) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;

    if (!auth) {
      throw new UnauthorizedException("Token not found");
    }

    try {
      const token = auth.split(" ")[1];
      const user = this.jwtToken.verifyToken(token);

      req.user = user;
      return true;
    } catch (err) {
      if(err instanceof Error) {
        throw new UnauthorizedException(err.message);
      }
      
      return false
    }
  }
}