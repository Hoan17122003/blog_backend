import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AdminModule } from './admin/admin.module';
import { CategoryModule } from './category/category.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { FollowModule } from './follow/follow.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        DatabaseModule,
        UserModule,
        PostModule,
        AdminModule,
        CategoryModule,
        TagModule,
        CommentModule,
        FollowModule,
        ChatModule,
        AuthModule,
    ],
})
export class AppModule {}
