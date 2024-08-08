import {
    Controller,
    ForbiddenException,
    HttpStatus,
    Post,
    Session,
    UnauthorizedException,
    UseGuards,
    Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/LocalAuth.guard';
import { Public } from './decorator/public.decorator';
import { JwtAccessAuth } from './guard/JwtAccess.guard';
import { Response } from 'express';

@UseGuards(JwtAccessAuth)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login/local')
    async Login(@Session() session: Record<string, any>, @Res() res: Response) {
        try {
            const user_id: number = session.payload['user_id'];
            const user = session.payload;
            const timeCookie = Number.parseInt(process.env.JWTACCESSTOKENTIME, 10) * 3600*60;
            console.log('timeCookie : ', timeCookie, ' ', typeof timeCookie);
            res.cookie('UserId', user_id, {
                httpOnly: false,
                maxAge: timeCookie,
            });
            if (user.isActive === 0) {
                return res.status(HttpStatus.OK).json({
                    isActive: user.isActive,
                    email: user.email,
                    statuscode: HttpStatus.OK,
                    message: 'vui lòng xác thực email tài khoản',
                });
            }
            return res.status(HttpStatus.OK).json({
                message: 'login success !!!',
                statuscode: HttpStatus.OK,
                token: await this.authService.login(user_id),
                role: user.role,
            });
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
