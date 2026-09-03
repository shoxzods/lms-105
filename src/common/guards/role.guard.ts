import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const roles = this.reflector.get<UserRole[]>("roles", context.getHandler());

    if (!roles || roles.length === 0) {
      return true;
    }

    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
