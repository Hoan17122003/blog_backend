import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/Entity/user.entity';
import { UserDTO } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
export class UserService {
    constructor(@Inject('USERREPOSITORY') private readonly userRepository: Repository<User>) {}

    public async CreateAccount(data: UserDTO) {
        const isCheck = await this.userRepository.findOne({
            select: {
                email: true,
                username: true,
            },
            where: [
                {
                    email: data.email,
                },
                {
                    username: data.username,
                },
            ],
        });
        console.log('isCheck ', isCheck);
        if (isCheck?.username === data.username)
            throw new ForbiddenException('username bạn cung cấp đã tồn tại trong hệ thống');
        else if (isCheck?.email === data.email)
            throw new ForbiddenException('email bạn cung cấp đã tồn tại trong hệ thống');

        const user: User = new User(data.username, data.password, data.fullname, data.role, data.email);
        console.log('user : ', user);
        const userEntity: User = await this.userRepository.save(user);
        console.log(userEntity);
        return userEntity;
    }

    public async updateAvatar(user_id: number, avatar: any): Promise<User> {
        const user = await this.userRepository.findOne({ where: { user_id } });
        if (!user) throw new NotFoundException('user không tồn tại');
        Object.assign(user, avatar);
        return this.userRepository.save(user);
    }

    //get all user
    public async getAll(): Promise<Array<User>> {
        const userAll: Array<User> = await this.userRepository.find();
        return userAll;
    }

    public async setActive(email: string) {
        return this.userRepository.update({ email: email, isActive: 0 }, { isActive: 1 });
    }

    public async setPassword(newPassword: string, email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            select: {
                password: true,
            },
            where: {
                email: email,
            },
        });
        user.password = newPassword;
        return this.userRepository.save(user);
    }

    public async setRefreshToken(user_id: number, refresh_token: string = null): Promise<number> {
        const isCheck = await this.userRepository.update({ user_id }, { refresh_token: refresh_token });
        console.log(isCheck.affected)
        return isCheck.affected;
    }

    public async findById(user_id: number): Promise<User> {
        const user = this.userRepository.findOne({
            select: {
                user_id: true,
                username: true,
            },
            where: {
                user_id,
            },
        });
        return user;
    }

    public async checkRefreshToken(user_id: number, refresh_token: string): Promise<User> {
        const user = await this.userRepository.findOne({
            select: {
                user_id: true,
            },
            where: {
                user_id,
                refresh_token,
            },
        });
        return user;
    }
    public async findRelative(username: string, email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            select: {
                user_id: true,
                password: true,
                fullname: true,
                role: true,
                avatar: true,
                email: true,
            },
            where: [
                {
                    username: username,
                },
                {
                    email: email,
                },
            ],
        });
        return user;
    }
}
