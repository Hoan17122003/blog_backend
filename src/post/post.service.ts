import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { CreatePostDto } from './dto/post.dto';
import { Brackets, Like, Repository } from 'typeorm';
import { Post } from 'src/database/Entity/post.entity';
import { dataSource } from 'src/database/database.providers';
import { Category } from 'src/database/Entity/category.entity';
import { User } from 'src/database/Entity/user.entity';
import { Tag } from 'src/database/Entity/tag.entity';
import { UserService } from 'src/user/user.service';
import { TagService } from 'src/tag/tag.service';
import { Cache } from 'cache-manager';
import { Comment } from 'src/database/Entity/comment.entity';
import { Image } from 'src/database/Entity/Image.entity';

@Injectable()
export class PostSerivce {
    constructor(
        @Inject('POSTREPOSITORY') private readonly postRepository: Repository<Post>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async getPosts(pageNumber: number, pageSize: number, categoryName?: string, tagName?: string) {
        try {
            let posts;
            if (categoryName == undefined && tagName == undefined) {
                posts = await this.postRepository.find({
                    where: {
                        post_state: 1,
                    },
                    order: {
                        post_date: 'asc',
                    },
                    relations: {
                        tag: true,
                        user_wirte: true,
                        categories: true,
                        images: true,
                    },
                    skip: (pageNumber - 1) * pageNumber,
                    take: pageSize,
                });
            } else {
                posts = await this.postRepository
                    .createQueryBuilder('post')
                    .where('post.post_state = :postState', { postState: 1 })
                    .andWhere(
                        new Brackets((qb) => {
                            qb.where('categories.category_name = :categoryName', { categoryName }).orWhere(
                                'tag.tag_name = :tagName',
                                { tagName },
                            );
                        }),
                    )
                    .leftJoinAndSelect('post.tag', 'tag')
                    .leftJoinAndSelect('post.user_wirte', 'user_wirte')
                    .leftJoinAndSelect('post.categories', 'categories')
                    .leftJoinAndSelect('post.images', 'images')
                    .orderBy('post.post_date', 'ASC')
                    .skip((pageNumber - 1) * pageSize)
                    .take(pageSize)
                    .getMany();
            }

            posts.forEach((post) => {
                delete post.user_wirte.password;
                delete post.user_wirte.refresh_token;
                delete post.category_id;
            });

            return posts;
        } catch (error) {
            throw new Error(error);
        }
    }

    public async countPost() {
        const listPost = await this.postRepository.find({
            select: {
                post_id: true,
            },
        });
        return listPost.length;
    }

    async getPostDetail(post_id: number) {
        try {
            const post = await this.postRepository.find({
                select: {
                    post_name: true,
                    post_content: true,
                    post_date: true,
                    react: true,
                    comments: {
                        user: {
                            fullname: true,
                            avatar: true,
                            email: true,
                            password: false,
                            user_id: true,
                        },
                        content: true,
                        comment_date: true,
                        comment_id: true,
                        parent: {
                            user: {
                                fullname: true,
                                avatar: true,
                                email: true,
                                password: false,
                                user_id: true,
                            },
                            content: true,
                            comment_date: true,
                            comment_id: true,
                        },
                    },
                    user_wirte: {
                        password: false,
                        refresh_token: false,
                        username: false,
                        avatar: true,
                        user_id: true,
                        fullname: true,
                        email: true,
                        role: true,
                        followers: true,
                        following: true,
                    },
                    categories: {
                        category_name: true,
                    },
                    tag: {
                        tag_name: true,
                    },
                    images: true,
                },
                where: {
                    post_id,
                    // post_state: 1,
                },
                relations: {
                    tag: true,
                    comments: {
                        parent: {
                            user: true,
                        },
                        user: true,
                    },
                    user_wirte: {
                        followers: true,
                        following: true,
                    },
                    categories: true,
                    images: true,
                },
            });

            if (post[0].images) {
                post[0].images.forEach((image) => {
                    const placeHolder = `[image[${image.position}]]`;
                    const imgTag = `<img src="http://localhost:8080/${image.url}" alt="Image ${image.position}" />`;
                    post[0].post_content = post[0].post_content.replace(placeHolder, imgTag);
                });
                delete post[0].images;
            }

            return post[0];
        } catch (error) {
            throw new Error(error);
        }
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
            if (postCheck) {
                throw new Error('bài viết của bạn đã tồn tại');
            }

            const resultAllPromise = await Promise.allSettled([
                dataSource
                    .getRepository(Category)
                    .createQueryBuilder()
                    .where('category_name = :TenDanhMuc', { TenDanhMuc: postDTO.category_name })
                    .getOne(),
                userService.findById(user_id),
            ]);

            const [categoryResult, userResult] = resultAllPromise;

            if (categoryResult.status !== 'fulfilled' || userResult.status !== 'fulfilled') {
                throw new Error('Error in retrieving data');
            }

            let category = categoryResult.value;
            let user = userResult.value;

            const listTag = postDTO.tag_name.toString().split(',');
            let newTag: Array<Tag> = new Array<Tag>();
            if (listTag.length > 0) {
                listTag.forEach(async (element) => {
                    const tag: Tag = await tagService.findOne(element);
                    if (!tag) {
                        const tempTag: Tag = await tagService.save(element);
                        newTag.push(tempTag);
                    }
                });
            }
            let post_state = 0;
            if (user.role === 'admin') {
                post_state = 1;
            }

            const post = new Post(postDTO.post_name, postDTO.post_content, user_id, category.category_id);
            post.user_wirte = user;
            post.categories = category;
            post.tag = [...newTag];
            post.comments = null;
            post.images = null;
            post.post_state = post_state;

            return this.postRepository.save(post);
        } catch (error) {
            throw new Error(error);
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

    async destroy(postId: number[], user_id: number): Promise<any[]> {
        try {
            const result = await postId.map(async (post_id) => {
                const postEntitiy = await this.postRepository.findOne({
                    where: {
                        post_id,
                    },
                });
                if (!postEntitiy) throw new ForbiddenException(`${post_id} không tồn tại`);
                const a = Promise.all([
                    dataSource
                        .createQueryBuilder()
                        .update(Comment)
                        // .from(Comment)
                        .set({
                            parent: null,
                        })
                        .where('post_id = :postId', {
                            postId,
                        })
                        .execute()
                        .then(() => {
                            dataSource
                                .createQueryBuilder()
                                .delete()
                                .from(Comment)
                                .where('post_id = :post_id', {
                                    post_id,
                                })
                                .execute();
                        }),
                    ,
                    dataSource
                        .createQueryBuilder()
                        .delete()
                        .from(Image)
                        .where('post_id = :postId', {
                            postId,
                        })
                        .execute(),
                ]);
                const check = (await this.postRepository.delete({ post_id })).affected;
                return check;
            });
            return result;
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }

    async search(searchValue: string, pageSize: number, pageNumber: number): Promise<Post[]> {
        let [resutl, total] = await this.postRepository.findAndCount({
            where: [
                {
                    post_name: Like(`%${searchValue}%`),
                    post_state: 1,
                },
                {
                    user_wirte: {
                        fullname: Like(`%${searchValue}%`),
                    },
                    post_state: 1,
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

            skip: (pageNumber - 1) * pageSize,
            take: pageSize,
            order: {
                post_name: 'ASC',
            },
        });
        resutl.forEach((post) => {
            delete post.user_wirte.password;
            delete post.user_wirte.refresh_token;
            delete post.user_wirte.user_id;
            delete post.category_id;
            delete post.user_id;
        });
        return resutl;
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
