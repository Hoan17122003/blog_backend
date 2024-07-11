import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Tag } from './tag.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Category } from './category.entity';

@Entity('Post')
export class Post {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        name: 'post_id',
    })
    post_id: number;

    @Column({
        type: 'nvarchar',
        length: 255,
        name: 'post_name',
    })
    post_name: string;

    @Column({
        type: 'nvarchar',
        length: 2000,
        nullable: false,
    })
    post_content: string;

    @Column({
        type: 'datetime',
        name: 'post_date',
    })
    post_date: Date;

    @Column({
        type: 'int',
        default: 0,
    })
    post_state: number;

    @Column({
        type: 'int',
        name: 'user_id',
    })
    user_id: number;

    @Column({
        type: 'enum',
        // length: 30,
        enum: ['like', 'sad', 'angry', 'love', 'haha', 'wow'],
        default: null,
    })
    react: Array<string>;

    @Column({
        type: 'int',
        name: 'category_id',
    })
    category_id: number;

    ////////////////////////////////relation ship

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({
        name: 'user_id',
    })
    user_wirte: User;

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable()
    tag: Tag[];

    @OneToMany(() => Comment, (comment) => comment.post)
    @JoinColumn({
        name: 'comment_id',
    })
    comments: Comment[];

    @ManyToOne(() => Category, (category) => category.posts)
    @JoinColumn({
        name: 'category_id',
    })
    categories: Category;
}
