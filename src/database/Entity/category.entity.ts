import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('Category')
export class Category {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        primaryKeyConstraintName: 'pk_category_id',
    })
    category_id: number;

    @Column({
        type: 'nvarchar',
        length: 30,
    })
    category_name: string;

    @OneToMany(() => Post, (post) => post.categories)
    @JoinColumn({
        name: 'post_id',
    })
    posts: Post[];
}
