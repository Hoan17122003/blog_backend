import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, Check, Unique } from 'typeorm';
import { Post } from './post.entity';

@Unique(['tag_name'])
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
