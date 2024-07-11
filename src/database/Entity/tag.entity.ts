import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity('Tag')
export class Tag {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        primaryKeyConstraintName: 'pk_tag_id',
    })
    tag_id: number;

    @Column({
        type: 'nvarchar',
        length: 30,
    })
    tag_name: string;

    @ManyToMany(() => Post, (post) => post.tag)
    posts: Post[];
}
