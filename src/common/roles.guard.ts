

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./auth.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredRoles) {
        return true;
      }
      
      const { user } = context.switchToHttp().getRequest();
      console.log('User in RolesGuard:', user);
      
      if (!user || !requiredRoles.includes(user.role)) {
        throw new ForbiddenException('Access denied');
      }
      
      const hasRole = () => requiredRoles.includes(user.role);
      return hasRole();;
}
}
