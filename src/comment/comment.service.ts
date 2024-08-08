import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/database/Entity/user.entity';
import { Post } from 'src/database/Entity/post.entity';
import { Comment } from 'src/database/Entity/comment.entity';
import { dataSource } from 'src/database/database.providers';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CommentService {
    constructor(
        @Inject('COMMENTREPOSITORY')
        private readonly commentRepository: Repository<Comment>,
    ) {}

    async createComment(user: User, post: Post, content: string): Promise<Comment> {
        const comment = this.commentRepository.create({ content, user, post });
        comment.user_id = user.user_id;
        comment.post_id = post.post_id;
        comment.content = content;
        return this.commentRepository.save(comment);
    }

    async replyToComment(user: User, post: Post, content: string, parent: Comment): Promise<Comment> {
        const reply = this.commentRepository.create({ content, user, post, parent });
        reply.user_id = user.user_id;
        reply.post_id = post.post_id;
        reply.content = content;
        return this.commentRepository.save(reply);
    }

    async findCommentsByPost(postId: number): Promise<Comment[]> {
        return this.commentRepository.find({
            where: { post: { post_id: postId }, parent: null },
            relations: ['user', 'parent'],
        });
    }

    async findRepliesByComment(commentId: number): Promise<Comment[]> {
        return this.commentRepository.find({
            where: { parent: { comment_id: commentId } },
            relations: ['user', 'parent'],
        });
    }

    async findById(comment_id: number): Promise<Comment> {
        return this.commentRepository.findOne({
            where: {
                comment_id,
            },
        });
    }
    async changeContentComment(content: string, post_id: number, comment_id: number, user_id: number) {
        try {
            const comment = await this.commentRepository.findOne({
                where: {
                    comment_id: comment_id,
                    post_id: post_id,
                    user_id: user_id,
                },
            });
            if (!comment) throw new ForbiddenException('bạn không thể truy cập vào tài nguyên này ');
            comment.content = content;
            await this.commentRepository.save(comment);
            return comment;
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    async deleteComment(comment_id: number, post_id: number, user_id: number, userService: UserService) {
        try {
            const userEntity = await userService.findById(user_id);

            const comment = await this.commentRepository.findOne({
                where: {
                    comment_id: comment_id,
                    post_id,
                    // user_id,
                    user: userEntity,
                },
            });
            if (!comment && userEntity.role != 'admin')
                throw new ForbiddenException('bạn không thể truy cập vào tài nguyên này');
            await this.commentRepository.delete(comment_id);
            return true;
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
}
