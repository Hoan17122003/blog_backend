import { ConflictException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { CreatePostDto } from './dto/post.dto';
import { Like, Repository } from 'typeorm';
import { Post } from 'src/database/Entity/post.entity';
import { dataSource } from 'src/database/database.providers';
import { Category } from 'src/database/Entity/category.entity';
import { User } from 'src/database/Entity/user.entity';
import { Tag } from 'src/database/Entity/tag.entity';
import { UserService } from 'src/user/user.service';
import { TagService } from 'src/tag/tag.service';
import { Cache } from 'cache-manager';

@Injectable()
export class PostSerivce {
    constructor(
        @Inject('POSTREPOSITORY') private readonly postRepository: Repository<Post>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async getAll() {
        const posts = await this.postRepository.find({
            select: {
                post_name: true,
                post_content: true,
                react: true,
                user_wirte: {
                    fullname: true,
                    email: true,
                    avatar: true,
                },
                comments: {
                    user: {
                        fullname: true,
                        avatar: true,
                    },

                    content: true,
                },
                tag: {
                    tag_name: true,
                },
            },
            where: {
                post_name: Like(`%Công nghệ%`),
            },
            order: {
                post_name: 'ASC',
            },

            relations: {
                tag: true,
                user_wirte: true,
                comments: true,
            },
        });
        console.log('posts : ', posts);
        return posts;
    }

    async create(
        postDTO: CreatePostDto,
        user_id: number,
        userService: UserService,
        tagService: TagService,
    ): Promise<Post> {
        try {
            const postCheck = await this.postRepository.findOne({
                where: {
                    post_name: postDTO.post_name,
                    user_id: user_id,
                    categories: {
                        category_name: postDTO.category_name,
                    },
                },
                relations: {
                    categories: true,
                },
            });
            if (postCheck) throw new ConflictException('bài viết của bạn đã tồn tại');

            const resultAllPromise = await Promise.allSettled([
                await dataSource
                    .getRepository(Category)
                    .createQueryBuilder()
                    .where('category_name = :TenDanhMuc', {
                        TenDanhMuc: postDTO.category_name,
                    })
                    .getOne(),
                await userService.findById(user_id),
                await tagService.findOne(postDTO.tag_name),
            ]).then(async (result) => {
                const [category, user, tag] = result;
                let newTag: Tag = tag['value'];
                console.log('newTag : ', newTag);
                if (postDTO.tag_name && !newTag?.tag_id) {
                    newTag = await tagService.save(postDTO.tag_name);
                }
                return [category['value'], user['value'], newTag];
            });

            const [categoryEntity, userEntity, tag] = resultAllPromise;

            const post = new Post(postDTO.post_name, postDTO.post_content, user_id, categoryEntity.category_id);
            post.user_wirte = userEntity;
            post.categories = categoryEntity;
            post.tag = [tag];
            post.comments = null;
            return this.postRepository.save(post);
        } catch (error) {
            throw new ConflictException(error);
        }
    }

    async browseArticles(postDTO: { post_id: number; state: number }): Promise<Post> {
        try {
            const post = await this.postRepository.findOne({
                where: {
                    post_id: postDTO.post_id,
                },
            });
            if (!post) throw new ForbiddenException('bài viết không tồn tại');
            post.post_state = postDTO.state;
            return this.postRepository.save(post);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
    async changePost(postDTO: CreatePostDto, user_id: number): Promise<Post> {
        try {
            const post = await this.postRepository.findOne({
                where: {
                    user_id,
                },
            });
            if (!post) throw new ForbiddenException('truy cập tài nguyên không hợp lệ');
            Object.keys(postDTO).forEach((key) => {
                if (postDTO[key]) {
                    post[key] = postDTO[key];
                }
            });
            return this.postRepository.save(post);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async destroy(postId: number[], user_id: number): Promise<boolean> {
        try {
            let result: number[];
            postId.forEach(async (post_id) => {
                const post = await this.postRepository.findOne({
                    where: {
                        post_id,
                        user_id,
                    },
                });
                if (!post) throw new ForbiddenException(`${post_id} không tồn tại`);
                const check = (await this.postRepository.delete({ post_id })).affected;
                result.push(check);
            });
            return result.includes(0);
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async search(searchValue: string, pageSize: number, pageNumber: number): Promise<Post[]> {
        let result: Post[] = await this.postRepository.find({
            select: {
                post_name: true,
                post_content: true,
                post_date: true,
                react: true,
                post_state: true,
                user_wirte: {
                    user_id: true,
                    fullname: true,
                    avatar: true,
                    email: true,
                },
                tag: {
                    tag_name: true,
                },
                comments: {
                    comment_id: true,
                    user: {
                        username: true,
                        avatar: true,
                    },
                    content: true,
                    comment_date: true,
                    parent: {
                        content: true,
                        comment_date: true,
                        comment_id: true,
                        user: {
                            fullname: true,
                            role: true,
                        },
                    },
                },
                categories: {
                    category_name: true,
                },
            },
            where: [
                {
                    post_name: Like(`%${searchValue}%`),
                },
                {
                    user_wirte: {
                        fullname: Like(`%${searchValue}%`),
                    },
                },
            ],
            relations: {
                user_wirte: true,
                tag: true,
                comments: {
                    user: true,
                    parent: true,
                },
                categories: true,
            },

            // skip: (pageNumber - 1) * pageSize,
            // take: pageSize,
            order: {
                post_name: 'ASC',
            },
        });
        return result;
    }
    async getPostPending() {
        return this.postRepository.find({
            select: {
                user_wirte: {
                    fullname: true,
                    email: true,
                    avatar: true,
                    role: true,
                },
            },
            where: {
                post_state: 0,
            },
            relations: {
                user_wirte: true,
            },
        });
    }
    async getAdminBrowseArticles(user_id: number) {
        try {
            const loggingAdminPost = await this.cacheManager.get('admin_browse-articles');
            if (user_id ?? true) {
                return loggingAdminPost;
            }
            console.log('loggingadminpost : ', loggingAdminPost);
            return 1;
        } catch (error) {
            throw new Error(error);
        }
    }

    async findById(post_id: number): Promise<Post> {
        return await this.postRepository.findOne({
            where: {
                post_id,
            },
        });
    }
}
