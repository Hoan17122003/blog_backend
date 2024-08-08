import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Image } from 'src/database/Entity/Image.entity';
import { Repository } from 'typeorm';
import ImageDTO from './dto/image.dto';
import { Post } from 'src/database/Entity/post.entity';

@Injectable()
export class ImageService {
    constructor(@Inject('IMAGEREPOSITORY') private readonly repository: Repository<Image>) {}

    async createImagePost(
        files: Array<Express.Multer.File>,
        post_id: number,
        position: number[] | number,
    ): Promise<Image[]> {
        try {
            console.log('files : ', files);
            const listImagesEntity = await Promise.all(
                files.map(async (image, index) => {
                    const imageEntity = new Image();
                    imageEntity.url = image.path;
                    imageEntity.position = position[index];
                    imageEntity.post = { post_id } as Post;
                    console.log('imageEntity : ', imageEntity);
                    return this.repository.save(imageEntity);
                }),
            );
            // const result = await this.repository.save(listImagesEntity, {
            //     reload: true,
            // });
            return listImagesEntity;
        } catch (error) {
            throw new ForbiddenException(error);
        }
    }
}
