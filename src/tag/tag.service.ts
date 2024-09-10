import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tag } from 'src/database/Entity/tag.entity';

@Injectable()
export class TagService {
    constructor(@Inject('TAGREPOSITORY') private readonly tagRepository: Repository<Tag>) {}

    async save(tag_name: string): Promise<Tag> {
        const tag = new Tag();
        tag.tag_name = tag_name;
        return this.tagRepository.save(tag);
    }
    async findOne(tag_name: string): Promise<Tag> {
        return this.tagRepository.findOne({
            where: {
                tag_name,
            },
        });
    }
}
