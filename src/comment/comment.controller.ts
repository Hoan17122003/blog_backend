import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Session,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAccessAuth } from 'src/auth/guard/JwtAccess.guard';
import { dataSource } from 'src/database/database.providers';
import { UserService } from 'src/user/user.service';
import { PostSerivce } from 'src/post/post.service';
import session from 'express-session';

@UseGuards(JwtAccessAuth)
@Controller('comment')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly userService: UserService,
        private readonly postService: PostSerivce,
    ) {}

    @Post('create-comment/:postId')
    async CreateComment(
        @Param('postId') post_id: number,
        @Session() session: Record<string, any>,
        @Body('content') content: string,
    ) {
        try {
            const user_id = session.user_id;
            const user = await this.userService.findById(user_id);
            const post = await this.postService.findById(post_id);
            if (!post) throw new NotFoundException('bài viết có lẻ đã được xoá ');
            return {
                statusCode: HttpStatus.OK,
                data: await this.commentService.createComment(user, post, content),
                message: 'create comment success!!!',
            };
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    @Post('/:postId/reply/:parentId')
    async RepliToComment(
        @Param('postId') post_id: number,
        @Param('parentId') parent_id: number,
        @Session() session: Record<string, any>,
        @Body('content') content: string,
    ) {
        try {
            const user_id = session.user_id;
            const post = await this.postService.findById(post_id);
            const user = await this.userService.findById(user_id);
            const parent = await this.commentService.findById(parent_id);
            return {
                statusCode: HttpStatus.OK,
                data: await this.commentService.replyToComment(user, post, content, parent),
                message: 'Reply comment success!!!',
            };
        } catch (error) {}
    }

    @Put('/PostId/ChangeComment')
    async ChangeComment(
        @Session() session: Record<string, any>,
        @Body('data')
        data: {
            post_id: number;
            content: string;
            comment_id: number;
        },
    ) {
        try {
            const user_id = session.user_id;
            return {
                codeStatus: HttpStatus.OK,
                message: 'chỉnh sửa comment thành công',
                data: await this.commentService.changeContentComment(
                    data.content,
                    data.post_id,
                    data.comment_id,
                    user_id,
                ),
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    @Delete('/PostId/DeleteComment/:PostId/:CommentId')
    async DeleteComent(
        @Session() session: Record<string, any>,
        @Param('PostId') postId: number,
        @Param('CommentId') commentId: number,
    ) {
        try {
            const user_id = session.user_id;
            return {
                codeStatus: HttpStatus.OK,
                message: 'delete success!!!',
                data: (await this.commentService.deleteComment(commentId, postId, user_id, this.userService))
                    ? 'xoá thành công bình luận thành công'
                    : 'xoá bình luận thất bại',
            };
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
}
