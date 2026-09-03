import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    //contex bodydan keladigan requestni ushlab beradi!
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Token was not send"); //Token yuborilmadi
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid token format"); //Token formati noto'g'ri
    }

    try {
      req.user = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });
      return true;
    } catch {
      throw new UnauthorizedException("The token is invalid or expired"); //Token yaroqsiz yoki muddati tugagan
    }
  }
}
