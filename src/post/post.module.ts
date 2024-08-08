import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';

import { DatabaseModule } from 'src/database/database.module';
import { unknowProviders } from 'src/database/dynamic-provider';
import { Post } from 'src/database/Entity/post.entity';
import { PostSerivce } from './post.service';
import { PostController } from './post.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { TagModule } from 'src/tag/tag.module';
import { Image } from 'src/database/Entity/Image.entity';
import { ImageService } from './image.service';

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({}),
        UserModule,
        TagModule,
        CacheModule.register({
            store: redisStore,
            host: 'localhost',
            port: 6380,
        }),
    ],
    providers: [
        unknowProviders('POSTREPOSITORY', Post),
        PostSerivce,
        unknowProviders('IMAGEREPOSITORY', Image),
        ImageService,
    ],
    controllers: [PostController],
    exports: [PostSerivce],
})
export class PostModule {}
