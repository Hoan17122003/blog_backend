import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostSerivce } from './post/post.service';
import { User } from './database/Entity/user.entity';
import { Post } from './database/Entity/post.entity';
import { UserService } from './user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
    private users: Map<string, Array<User>>;
    private userTime: Date;
    private posts: Map<string, Array<Post>>;
    private posTime: Date;

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    // sort min to max with fullname or email : user
    async search(
        searchValue: string,
        postService: PostSerivce,
        userService: UserService,
        flag: string,
        pageNumber: number,
        pageSize: number,
    ): Promise<Array<Post> | Array<User>> {
        try {
            console.log('flag : ', flag);
            if (flag === 'user') {
                // // xử lý dữ liệu cache như thế nào khi dữ liệu mới người dùng vừa nhập vào ?
                // // giải pháp : check mỗi 30p ? vì dự án yêu cầu xử lý thời gian thực không cao
                // if (this.users.size > 0) {
                //     // thuật toán tìm kiếm nào phù hợp ?
                //     if (this.users.get(searchValue).length > 0 && this.users.get(searchValue)) {
                //         setInterval(async () => {
                //             const oldUser = this.users.get(searchValue);
                //             const user = await userService.search(searchValue, pageSize, pageNumber);

                //             this.users.set(searchValue, user);
                //         }, 1800000);
                //         return this.users.get(searchValue);
                //     } else {
                //         const user: Array<User> = await userService.search(searchValue, pageSize, pageNumber);
                //         this.users.set(searchValue, user);
                //         return user;
                //     }
                // } else {
                //     // khi cache trống thì query xog trả về cho user;
                //     const user: Array<User> = await userService.search(searchValue, pageSize, pageNumber);
                //     this.users.set(searchValue, user);
                //     return user;
                // }
                // phân trang thông thường
                const users: Array<User> = await userService.search(searchValue, pageSize, pageNumber);
                console.log('user', users);
                return users;
            } else if (flag === 'page') {
                const posts: Array<Post> = await postService.search(searchValue, pageSize, pageNumber);
                console.log('post : ', posts);

                return posts;
            }
        } catch (error) {
            throw new NotFoundException(error);
        }
    }
}
