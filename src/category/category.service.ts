import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Category } from 'src/database/Entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
    constructor(@Inject('CATEGORYREPOSITORY') private readonly categoryRepository: Repository<Category>) {}

    public async create(categoryDTO: string) {
        if (
            await this.categoryRepository.findOne({
                where: {
                    category_name: categoryDTO,
                },
            })
        ) {
            throw new ForbiddenException('Tên category của bạn nhập vào đã tồn tại');
        }
        const category = new Category();
        category.category_name = categoryDTO;
        await this.categoryRepository.save(category);
        return category;
    }

    public async fillterPost(category_name: string, user_id: number = null, flag: string = 'global') {
        let categories;
        if (flag.toLowerCase() === 'local') {
            categories = await this.categoryRepository.find({
                where: {
                    category_name,
                    posts: {
                        user_id: user_id,
                        post_state: 1,
                    },
                },
                relations: {
                    posts: true,
                },
            });
        } else if (flag.toLowerCase() === 'global') {
            categories = await this.categoryRepository.find({
                where: {
                    category_name,
                    posts: {
                        post_state: 1,
                    },
                },
                relations: {
                    posts: true,
                },
            });
        }

        return categories;
    }

    public async getAll(): Promise<Category[]> {
        const result = await this.categoryRepository.find({
            select: {
                category_name: true,
            },
        });
        return result;
    }
}
