import { Injectable, Inject, ForbiddenException, NotFoundException, flatten } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
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
        console.log(isCheck.affected);
        return isCheck.affected;
    }

    public async findById(user_id: number): Promise<User> {
        const user = this.userRepository.findOne({
            select: {
                user_id: true,
                avatar: true,
                fullname: true,
                email: true,
                role: true,
            },
            where: {
                user_id,
            },
        });
        return user;
    }

    public async findByEmail(email: string): Promise<User> {
        return await this.userRepository.findOne({
            where: {
                email: email,
            },
        });
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
        console.log('email : ', email);
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

    // phân trang được sử dụng find khi không kèm thêm cái relationship trong đó
    async search(valueSearch: string, pageSize: number, pageNumber: number): Promise<Array<User> | undefined> {
        try {
            const users: Array<User> = await this.userRepository.find({
                select: {
                    user_id: true,
                    fullname: true,
                    email: true,
                    role: true,
                    avatar: true,
                },
                where: [
                    {
                        email: Like(`%${valueSearch}%`),
                    },
                    {
                        fullname: Like(`%${valueSearch}%`),
                    },
                ],
                order: {
                    fullname: 'ASC',
                },
                skip: pageSize * (pageNumber - 1),
                take: pageSize,
            });
            return users;
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    public async changeinformation(data: { fullname?: string; password?: string }, user_id: number): Promise<string> {
        const user = await this.userRepository.findOne({
            where: {
                user_id,
            },
        });

        if (!user) throw new NotFoundException('User không tồn tại');
        Object.keys(data).forEach((key) => {
            if (data[key]) {
                user[key] = data[key];
            }
        });
        const newInformationUser = await this.userRepository.save(user);
        return newInformationUser ? 'thay đổi thông tin thành công' : 'thay đổi  thông tin thất bại';
    }

    public async profile(user_id: number) {
        try {
            const user = await this.userRepository.find({
                select: {
                    fullname: true,
                    email: true,
                    avatar: true,
                    role: true,
                    posts: {
                        post_name: true,
                        post_content: true,
                        post_date: true,
                        post_state: true,
                        comments: {
                            user: {
                                username: true,
                                avatar: true,
                                role: true,
                            },
                            content: true,
                            comment_date: true,
                        },
                        react: true,
                    },
                    followers: {
                        user_id: true,
                    },
                    following: {
                        user_id: true,
                    },
                },
                where: {
                    user_id: user_id,
                },
                relations: {
                    posts: true,
                    followers: true,
                    following: true,
                },
                order: {
                    posts: {
                        react: 'desc',
                    },
                },
            });
            if (user && user[0].posts) {
                user[0].posts = user[0].posts.filter((post) => post.post_state === 1);
            }
            if (!user) throw new NotFoundException('không tim thấy trang người dùng');
            return user;
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    //api giúp người dùng biết các api các bài viết của mình đang chờ duyệt
    async postPending(user_id: number) {
        try {
            const postsPending = await this.userRepository.find({
                select: {
                    fullname: false,
                    password: false,
                    role: false,
                    avatar: false,
                    email: false,
                    refresh_token: false,
                    posts: {
                        post_name: true,
                        post_content: true,
                        post_date: true,
                    },
                },
                where: {
                    user_id,
                    posts: {
                        post_state: 0,
                    },
                },
                order: {
                    posts: {
                        post_date: 'DESC',
                    },
                },
                relations: {
                    posts: true,
                },
            });
            if (!postsPending[0].posts) throw new NotFoundException('không tìm thấy bài viết nào chờ duyệt');
            return postsPending;
        } catch (error) {
            throw new NotFoundException(error);
        }
    }
}
