import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { unknowProviders } from 'src/database/dynamic-provider';
import { Comment } from 'src/database/Entity/comment.entity';
import { CommentService } from './comment.service';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [DatabaseModule, UserModule, PostModule, JwtModule.register({})],
    providers: [unknowProviders('COMMENTREPOSITORY', Comment), CommentService],
    controllers: [CommentController],
    exports: [CommentService],
})
export class CommentModule {}
