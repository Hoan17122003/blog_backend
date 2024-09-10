import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class Image {
    @PrimaryGeneratedColumn({
        type: 'int',
        primaryKeyConstraintName: 'pk_image_id',
    })
    image_id: number;

    @Column({
        type: 'nvarchar',
        nullable: true,
    })
    url: string;

    @Column({
        type: 'int',
        nullable: false,
    })
    position: number;

    @ManyToOne(() => Post, (post) => post.images)
    @JoinColumn({
        name: 'post_id',
    })
    post: Post;
}
