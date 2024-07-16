import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Roles, ROLES } from '../decorator/role.decorator';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflactor: Reflector,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles: string[] = await this.reflactor.getAllAndOverride(ROLES, [
            context.getHandler(),
            context.getClass(),
        ]);
        const isPublic = this.reflactor.getAllAndOverride(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) return true;
        const request = context.switchToHttp().getRequest();
        const role = await this.userService.findById(request.session.user_id);
        const check = roles.includes(role.role);
        console.log('check : ', check);
        return check;
    }
}
