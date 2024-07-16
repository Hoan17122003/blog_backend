import {
    Controller,
    UseGuards,
    Body,
    Post,
    Session,
    HttpStatus,
    ConflictException,
    Put,
    ForbiddenException,
    Delete,
    Query,
    Get,
    UseInterceptors,
} from '@nestjs/common';

import { PostSerivce } from './post.service';
import { JwtAccessAuth } from 'src/auth/guard/JwtAccess.guard';
import { CreatePostDto } from './dto/post.dto';
import { Roles } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/guard/Role.guard';
import session from 'express-session';
import { UserService } from 'src/user/user.service';
import { TagService } from 'src/tag/tag.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { LoggingPost } from './interceptor/loggingpost.interceptor';

@UseGuards(JwtAccessAuth)
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostSerivce,
        private readonly userService: UserService,
        private readonly tagService: TagService,
    ) {}

    @Post('create')
    async CreatePost(@Body('post') createPostDto: CreatePostDto, @Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            return {
                message: 'create post success',
                statusCode: HttpStatus.OK,
                data: (await this.postService.create(createPostDto, user_id, this.userService, this.tagService))
                    ? 'đăng bài thành công, đang chờ duyệt'
                    : 'đăng bài thất bại',
            };
        } catch (error) {
            throw new ConflictException(error);
        }
    }
    @Public()
    @Get('all')
    async GetAll() {
        return this.postService.getAll();
    }

    @Delete('delete')
    async DeletePost(@Body('post_ids') postId: number[], @Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            return {
                data: (await this.postService.destroy(postId, user_id))
                    ? 'xoá bài viết thất bại'
                    : 'xoá bài viết thành công',
            };
        } catch (error) {}
    }

    @Put('change')
    async ChangePost(@Body('post') changePostDTO: CreatePostDto, @Session() session: Record<string, any>) {
        const user_id = session.user_id;
        try {
            return {
                message: 'change post success',
                statusCode: HttpStatus.OK,
                data: (await this.postService.changePost(changePostDTO, user_id))
                    ? 'cập nhật thành công'
                    : 'cập nhật bài viết thất bại',
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    @Roles('admin')
    @UseGuards(RolesGuard)
    @UseInterceptors(LoggingPost)
    @Put('browse-articles')
    async BrowseArticles(@Body('post') postDTO: { post_id: number; state: number }) {
        try {
            return {
                message: 'change state post success',
                statusCode: HttpStatus.OK,
                data: (await this.postService.browseArticles(postDTO))
                    ? 'cập nhật thành công'
                    : 'cập nhật bài viết thất bại',
            };
        } catch (error) {
            throw new ForbiddenException('Không thể xoá');
        }
    }
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Get('get-post-pending')
    async getPostPending() {
        return this.postService.getPostPending();
    }

    @Roles('admin')
    @UseGuards(RolesGuard)
    @Get('get-history-browse-articles')
    async GetHisitoryBrownseArticles(@Query('user_id') user_id: number) {
        console.log('hehehe')
        return this.postService.getAdminBrowseArticles(user_id);
    }
}
