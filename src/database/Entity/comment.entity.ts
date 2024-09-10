import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('Comment')
export class Comment {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        primaryKeyConstraintName: 'pk_comment_id',
    })
    comment_id: number;

    @Column({
        type: 'text',
    })
    content: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    comment_date: Date;

    @Column({
        type: 'int',
    })
    user_id: number;

    @Column({
        type: 'int',
    })
    post_id: number;

    @ManyToOne(() => User, (user) => user.comments)
    @JoinColumn({
        name: 'user_id',
    })
    user: User;

    @ManyToOne(() => Post, (post) => post.comments)
    @JoinColumn({
        name: 'post_id',
    })
    post: Post;

    @ManyToOne(() => Comment, {
        nullable: true,
    })
    parent: Comment;
}
