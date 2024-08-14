import {
    Controller,
    ForbiddenException,
    HttpStatus,
    Post,
    Session,
    UnauthorizedException,
    UseGuards,
    Res,
    Get,
    Next,
    Req,
} from '@nestjs/common';
import * as cors from 'cors';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/LocalAuth.guard';
import { Public } from './decorator/public.decorator';
import { JwtAccessAuth } from './guard/JwtAccess.guard';
import { Response } from 'express';
import { JwtRefreshTokenGuard } from './guard/JwtRefresh.guard';

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
            const timeCookie = Number.parseInt(process.env.JWTACCESSTOKENTIME, 10) * 3600 * 60;
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

    @Get('cookie')
    public async GetCookie(@Session() session: Record<string, any>, @Res() res: Response, @Next() next, @Req() req) {
        try {
            const userId = session.user_id;

            res.cookie('UserId', userId, {
                httpOnly: true,
                secure: false,
                sameSite: 'none',
                maxAge: 3600 * 60 * 3,
                domain: 'localhost',
            });
            return res.status(HttpStatus.OK).json({
                message: 'lấy cookie thành công',
            });
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    @Public()
    @UseGuards(JwtRefreshTokenGuard)
    @Get('getToken')
    async GetAccessToken(@Session() session: Record<string, any>) {
        const userId = session.user_id;
        try {
            return this.authService.generateAccessToken(userId);
        } catch (error) {
            throw new Error(error);
        }
    }

    @Post('logout')
    async Logout(@Session() session: Record<string, any>) {
        try {
            const user_id = await session.user_id;

            const result = await this.authService.logout(user_id);
            return result ? 1 : 0;
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
}
