import { Controller, Get, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PostSerivce } from './post/post.service';
import { UserService } from './user/user.service';
import { NotFoundError } from 'rxjs';

@Controller('')
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly postService: PostSerivce,
        private readonly userService: UserService,
    ) {}

    // how to call ?
    // answer flag = page is search all value post, flag = user call value all user
    @Get('search')
    async Search(
        @Query('q') searchValue: string,
        @Query('p') flag: string = 'page',
        @Query('PageNumber') pageNumber: number,
        @Query('PageSize') pageSize: number,
    ) {
        try {
            return {
                data: await this.appService.search(
                    searchValue,
                    this.postService,
                    this.userService,
                    flag,
                    pageNumber,
                    pageSize,
                ),
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            throw new NotFoundException(error);
        }
    }
}
