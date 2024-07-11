import {
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

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly mailService: MailService,
        private readonly jwtService: JwtService,
    ) {}

    @Post('create-account/local')
    async create(@Body('user') data: UserDTO) {
        try {
            console.log('data : ', data);
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

    @Post('/sent-validateToken')
    public async SendMail(
        @Body('NameEmail') nameEmail: string,
        @Body('subject') content: string,
        @Body('link') link?: string,
    ) {
        let validateToken = '';
        for (let i = 0; i < 6; i++) {
            const tokenRandom = Math.floor(Math.random() * 9) + 1;
            validateToken += tokenRandom.toString();
        }
        console.log('validate : ', validateToken);

        if (link) {
            await this.mailService.sendUserConfirmation({
                email: `${nameEmail}`,
                subject: `Welcome to website-blog! ${content}`,
                content: `${content} validate token : ${link}`,
            });
        } else if (link ?? true) {
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

    @UseInterceptors(ValidateToKenInterceptor)
    @Post('/ValidateToken')
    async check(@Body('email') email: string) {
        const setActive = this.userService.setActive(email);
        return {
            message: 'Token is valid',
            statuscode: HttpStatus.OK,
        };
    }

    @Post('forget-password')
    async forgetPassword(@Body('user') user: { newPassword: string; email: string; link: string; content: string }) {
        try {
            // await this.SendMail(user.email, user.content, user.link); client call send-mail method with sent-link set password
            const handleChangePassword = await this.userService.setPassword(user.newPassword, user.email);
            if (handleChangePassword ?? true) throw new ForbiddenException('rất tiết đã xảy ra lỗi  ');
            return {
                message: 'Password changed successfully',
                statuscode: HttpStatus.OK,
            };
        } catch (error) {}
    }

    @UseGuards(JwtAccessAuth)
    @Get('')
    async getAll() {
        return this.userService.getAll();
    }

    // update avatar
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads',
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
    @Post('/:user_id/avatar')
    async UpLoadFile(@Param('user_id', new ParseIntPipe()) user_id: number, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }
        const updateUserDto = { avatar: file.path };

        return this.userService.updateAvatar(user_id, updateUserDto);
    }

    // change information user
    // @Put('/profile/change-information')
    // async ChangeInformation(@Session()) {
    //     try {
    //         return
    //     } catch (error) {

    //     }
    // }
}
