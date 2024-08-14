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
    Param,
    NotFoundException,
    ParseIntPipe,
    UploadedFiles,
    BadRequestException,
    NotAcceptableException,
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
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import ImageDTO from './dto/image.dto';
import { ImageService } from './image.service';
import { diskStorage } from 'multer';
import * as path from 'path';

@UseGuards(JwtAccessAuth)
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostSerivce,
        private readonly userService: UserService,
        private readonly tagService: TagService,
        private readonly imageService: ImageService,
    ) {}

    // create post
    @Post('create')
    async CreatePost(@Body('post') createPostDto: CreatePostDto, @Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            const postCheck = await this.postService.create(createPostDto, user_id, this.userService, this.tagService);

            return {
                message: 'create post success',
                statusCode: HttpStatus.OK,
                data: postCheck ? 'đăng bài thành công, đang chờ duyệt' : 'đăng bài thất bại',
                postId: postCheck.post_id,
            };
        } catch (error) {
            // throw new NotAcceptableException(error);
            throw new Error(error);
        }
    }

    //create images with post
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            storage: diskStorage({
                destination: './uploads/post',
                filename: (req, file, cb) => {
                    const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + Date.now();
                    const extension: string = path.parse(file.originalname).ext;
                    cb(null, `${filename}${extension}`);
                    // cb(null, file.originalname);
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
    // @UseInterceptors(FilesInterceptor('images'))
    @Post('image')
    async CreateImageWithPost(
        // @UploadedFiles() files: { images?: Express.Multer.File[] },
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body('post_id', ParseIntPipe) post_id: number,
        @Body('positions') positions: number[] | number,
    ) {
        try {
            positions = positions
                .toString()
                .split(',')
                .map((element) => Number(element));
            const postEntity = await this.postService.findById(post_id);
            if (!postEntity) throw new ForbiddenException('bài viết không tồn tại ');
            if (files.length == 0) throw new ForbiddenException('Khong co file anh nao dc up');
            const image = files.map((element, index) => ({
                file: element,
                positions: positions[index],
            }));
            return {
                statusCode: HttpStatus.OK,
                message: 'tạo ảnh thành công',
                data: await this.imageService.createImagePost(files, post_id, positions),
                // data: 'hehehe',
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    @Public()
    @Get('all')
    // async GetAll(@Query('q', ParseIntPipe) pageNumber: number, @Query('p', ParseIntPipe) pageSize: number) {
    async GetAll(@Query() data: { q: number; p: number; categoryName?: string; tagName?: string }) {
        try {
            if (data.categoryName === 'undefined' && data.tagName === 'undefined') {
                return this.postService.getPosts(data.q, data.p);
            }
            return this.postService.getPosts(data.q, data.p, data.categoryName, data.tagName);
        } catch (error) {
            throw new Error(error);
        }
    }

    @Public()
    @Get('count')
    public async CountPost() {
        return this.postService.countPost();
    }

    @Public()
    @Get('detail/:PostId')
    async GetDetail(@Param('PostId') postId: number) {
        try {
            return {
                codeStatus: HttpStatus.OK,
                message: 'lấy dữ liệu thành công',
                data: await this.postService.getPostDetail(postId),
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    @Delete('delete/:post_id')
    async DeletePost(@Param('post_id') postId: number[], @Session() session: Record<string, any>) {
        try {
            const user_id = session.user_id;
            postId = postId
                .toString()
                .split(',')
                .map((element) => Number.parseInt(element, 10));
            return {
                data: (await this.postService.destroy(postId, user_id))
                    ? 'xoá bài viết thất bại'
                    : 'xoá bài viết thành công',
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    @Put('change/:post_id')
    async ChangePost(
        @Param('post_id') post_id: number,
        @Body('post') changePostDTO: CreatePostDto,
        @Session() session: Record<string, any>,
    ) {
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
        return this.postService.getAdminBrowseArticles(user_id);
    }
}
