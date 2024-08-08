import { Injectable, CanActivate, ExecutionContext, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ValidateGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.token;
        const email = await this.jwtService.verifyAsync(token, {
            secret: process.env.VALIDATESECRET,
        });
        const user = await this.userService.findByEmail(email);
        if (!user) throw new NotFoundException('not found');
        request.session.email = email;

        return true;
    }
}
