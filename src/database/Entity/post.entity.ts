import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Check,
} from 'typeorm';

import { Tag } from './tag.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import { Category } from './category.entity';
import { Image } from './Image.entity';

//post_state = 1 active , post_state = 0 pending, post_state = -1 destroy
@Check('post_state <= 1 and post_state >= -1')
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
        type: 'text',
        // length: 2000,
        nullable: false,
    })
    post_content: string;

    @Column({
        type: 'timestamp',
        name: 'post_date',
        default: () => 'CURRENT_TIMESTAMP',
    })
    post_date: Date;

    @Column({
        type: 'int',
        default: 0,
    })
    post_state: number;

    @Column({
        type: 'int',
        // name: 'user_id',
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

    public constructor(post_name: string, post_content: string, user_id: number, category_id: number) {
        this.post_name = post_name;
        this.post_content = post_content;
        this.user_id = user_id;
        this.category_id = category_id;
    }

    ////////////////////////////////relation ship

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({
        name: 'user_id',
    })
    user_wirte: User;

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable()
    tag?: Tag[];

    @OneToMany(() => Comment, (comment) => comment.post)
    @JoinColumn({
        name: 'comment_id',
    })
    comments?: Comment[];

    @ManyToOne(() => Category, (category) => category.posts)
    @JoinColumn({
        name: 'category_id',
    })
    categories: Category;

    @OneToMany(() => Image, (image) => image.post)
    @JoinColumn({ name: 'image_id' })
    images: Image[];
}
