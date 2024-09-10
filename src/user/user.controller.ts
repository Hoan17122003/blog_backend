import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Session,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ValidateToKenInterceptor } from './interceptor/ValidateToken.interceptor';
import { JwtAccessAuth } from 'src/auth/guard/JwtAccess.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { Roles } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/guard/Role.guard';
import { ValidateGuard } from 'src/auth/guard/ValidateGuard.guard';
import session from 'express-session';

@UseGuards(JwtAccessAuth)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) {}

    @Public()
    @Post('create-account/local')
    async create(@Body('user') data: UserDTO) {
        try {
            const a = await this.userService.CreateAccount(data);
            return {
                message: 'success',
                statuscode: HttpStatus.OK,
                response: a,
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    @Public()
    @Post('/sent-validateToken')
    public async SendMail(
        @Body('NameEmail') nameEmail: string,
        @Body('subject') content: string,
        @Body('link') link?: string, // support forget password method
    ) {
        let validateToken = '';
        for (let i = 0; i < 6; i++) {
            const tokenRandom = Math.floor(Math.random() * 9) + 1;
            validateToken += tokenRandom.toString();
        }

        if (link) {
            const token = await this.jwtService.signAsync(
                { nameEmail },
                {
                    secret: process.env.VALIDATESECRET,
                    expiresIn: '30m',
                },
            );
            const ref = `${process.env.ref}/${token}`;
            await this.mailService.sendUserConfirmation({
                email: `${nameEmail}`,
                subject: `Welcome to website-blog! forget ${content}`,
                content: `${content} validate token : ${ref}`,
            });
            return {
                statusCode: HttpStatus.OK,
                data: 'link khôi phục mật khẩu đã gửi đến mail của bạn',
            };
        } else {
            await this.mailService.sendUserConfirmation({
                email: `${nameEmail}`,
                subject: `Welcome to website-blog! ${content}`,
                content: `${content} validate token : ${validateToken}`,
            });
        }
        return {
            validateToken: await this.jwtService.signAsync(
                { validateToken },
                {
                    secret: process.env.VALIDATESECRET,
                    expiresIn: '10m',
                },
            ),
        };
    }

    //suport for setActive account
    @Public()
    @UseInterceptors(ValidateToKenInterceptor)
    @Post('/ValidateToken')
    async check(@Body('email') email: string) {
        const setActive = this.userService.setActive(email);
        return {
            message: 'Token is valid',
            statuscode: HttpStatus.OK,
        };
    }

    @Public()
    @UseGuards(ValidateGuard)
    @Post('forget-password')
    async forgetPassword(@Body('user') user: { newPassword: string }, @Session() session: Record<string, any>) {
        try {
            const email = session.email;
            const handleChangePassword = await this.userService.setPassword(user.newPassword, email);
            if (handleChangePassword ?? true) throw new ForbiddenException('rất tiết đã xảy ra lỗi  ');
            return {
                message: 'Password changed successfully',
                statuscode: HttpStatus.OK,
            };
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Roles('admin')
    @UseGuards(RolesGuard)
    @Get('admin/getAllUser')
    async getAll() {
        return this.userService.getAll();
    }

    // update avatar changeinformation
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/user',
                filename: (req, file, cb) => {
                    const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + Date.now();
                    const extension: string = path.parse(file.originalname).ext;
                    cb(null, `${filename}${extension}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                    return callback(null, false);
                }
                callback(null, true);
            },
        }),
    )
    @Put('/avatar')
    async UpLoadFile(@Session() session: Record<string, any>, @UploadedFile() file: Express.Multer.File) {
        const user_id = session.user_id;
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }

        const updateUserDto = { avatar: file.path };

        return this.userService.updateAvatar(user_id, updateUserDto);
    }

    // change information user only fullname or password
    @Put('/profile/change-information')
    async ChangeInformation(
        @Session() session: Record<string, any>,
        @Body('user')
        user: {
            fullname?: string;
            password?: string;
            email?: string;
        },
    ) {
        try {
            const user_id = await session.user_id;
            return {
                message: 'success',
                statuscode: HttpStatus.OK,
                data: await this.userService.changeinformation(user, user_id),
            };
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    @Public()
    @Get('/profile/:user_id')
    async Profile(@Param('user_id') user_id: number) {
        try {
            return {
                statusCode: HttpStatus.OK,
                data: await this.userService.profile(user_id),
                message: 'get profile success!!!',
            };
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    @Get('profile')
    async MeProfile(@Session() session: Record<string, any>) {
        const userId = session.user_id;

        try {
            return {
                statusCode: HttpStatus.OK,
                data: await this.userService.profile(userId),
                message: 'Get me profile success!!!',
                flag: true,
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    // @Get('profile/me')

    @Get('post-pending')
    async PostsPending(@Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            return {
                codeStatus: HttpStatus.OK,
                data: await this.userService.postPending(user_id),
                message: 'query success',
            };
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    @Post('follow')
    public async Follow(@Session() session: Record<string, any>, @Body('userId') userId: number) {
        try {
            const user_id = session.user_id;
            return {
                codeStatus: HttpStatus.OK,
                data: await this.userService.Follow(user_id, userId),
                message: 'success',
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    @Get('me')
    public async Me(@Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            return this.userService.me(user_id);
        } catch (error) {
            throw new Error(error);
        }
    }
    @Get('FollowingArticles')
    public async ArticlesFollowing(
        @Session() session: Record<string, any>,
        @Query('pn') pageNumber: number,
        @Query('ps') pageSize: number,
    ) {
        const user_id = session.user_id;
        return { data: await this.userService.FollowingArticles(user_id, pageNumber, pageSize) };
    }
}
