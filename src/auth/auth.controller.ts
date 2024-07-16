import {
    Controller,
    ForbiddenException,
    HttpStatus,
    Post,
    Session,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/LocalAuth.guard';
import { Public } from './decorator/public.decorator';
import { JwtAccessAuth } from './guard/JwtAccess.guard';

@UseGuards(JwtAccessAuth)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login/local')
    async Login(@Session() session: Record<string, any>) {
        try {
            const user_id: number = session.payload['user_id'];

            return {
                message: 'login success !!!',
                statuscode: HttpStatus.OK,
                token: await this.authService.login(user_id),
            };
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }

    @Post('logout')
    async Logout(@Session() session: Record<string, any>) {
        try {
            const user_id = await session.user_id;
            console.log('user_id : ', user_id);

            return this.authService.logout(user_id);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
}
