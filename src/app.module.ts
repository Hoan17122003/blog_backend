import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controlle';
import { AppService } from './app.service';
import { PostSerivce } from './post/post.service';
import * as redisStore from 'cache-manager-ioredis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        DatabaseModule,
        UserModule,
        PostModule,
        CategoryModule,
        TagModule,
        CommentModule,
        ChatModule,
        AuthModule,
        CacheModule.register({
            store: redisStore,
            host: 'localhost',
            port: 6380,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
    ],
    providers: [AppService],
    controllers: [AppController],
})
export class AppModule {}
