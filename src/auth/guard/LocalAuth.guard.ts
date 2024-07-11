import {
    Global,
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
@Injectable()
export class LocalAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const { username, password, email } = request.body;
            console.log('username : ', username, ' password:', password);
            if (!username || !password) throw new UnauthorizedException('thông tin không được bỏ trống');
            const payload = await this.authService.validate(username, password, email);
            request.session.payload = payload;
        } catch (error) {
            throw new UnauthorizedException(error);
        }
        return true;
    }
}
