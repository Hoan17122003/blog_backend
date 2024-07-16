import { Inject, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';

import { dataSource } from 'src/database/database.providers';
import { User } from 'src/database/Entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject('USER') private readonly userService: UserService,
    ) {}

    public async validate(username: string, password: string, email?: string) {
        const user = await this.userService.findRelative(username, email);
        if (!user) {
            throw new UnauthorizedException('thông tin đăng nhập không chính xác');
        }
        if (user && (await this.verifyPlainContentwithHashedContent(user.password, password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    private async verifyPlainContentwithHashedContent(hashedPassword: string, plainText): Promise<boolean> {
        const isMatching = await argon.verify(hashedPassword, plainText);
        if (!isMatching) return false;
        return true;
    }

    public async login(user_id: number): Promise<{ access_token: string; refresh_token: string }> {
        const refresh_token = this.generateRefreshToken(user_id);
        const access_token = this.generateAccessToken(user_id);
        await this.userService.setRefreshToken(user_id, refresh_token);
        return {
            access_token,
            refresh_token,
        };
    }

    public generateAccessToken(user_id: number) {
        return this.jwtService.sign(
            { user_id },
            {
                secret: process.env.JWTACCESSTOKENSECRET,
                expiresIn: process.env.JWTACCESSTOKENTIME,
            },
        );
    }

    public generateRefreshToken(user_id: number) {
        return this.jwtService.sign(
            { user_id },
            {
                secret: process.env.JWTREFRESHTOKENSECRET,
                expiresIn: process.env.JWTREFRESHTOKENTIME,
            },
        );
    }

    public async logout(user_id: number): Promise<number> {
        return this.userService.setRefreshToken(user_id);
    }

    public async validateRefreshToken(user_id: number, refresh_token: string) {
        // TODO: Implement your logic here to validate refresh token.
        // This method should return true if the token is valid and false otherwise.
        // For example, you can check the token against the database or a cache.
        //find user condition user_id and refresh_token
        // if not found user throw new Forbidenexecptioni
        const user = await this.userService.checkRefreshToken(user_id, refresh_token);
        if (!user) throw new ForbiddenException('thông tin refresh token không chính xác');
        return true; // Placeholder for actual validation logic.
    }
}
