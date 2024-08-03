

import { createParamDecorator, ExecutionContext, HttpException, SetMetadata } from "@nestjs/common";
export const Auth = createParamDecorator(
    (data: string | undefined, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new HttpException('Unauthorized', 401);
        }

        if (data) {
            return user[data];
          }
          return user;
    }
)

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);