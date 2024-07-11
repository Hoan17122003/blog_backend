import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { ManyToMany } from 'typeorm/browser';

import { User } from './user.entity';

@Entity('Follow')
export class Follow {
    @PrimaryColumn({
        type: 'int',
        name: 'user_id',
    })
    user_id: number;

    @PrimaryColumn({
        type: 'int',
        name: 'follow_id',
    })
    follow_id: number;

    @Column({
        type: 'datetime',
        name: 'date_folow',
    })
    date_folow: Date;

    @ManyToOne(() => User, (user) => user.userIsFollowing)
    @JoinColumn({
        name: 'user_id',
    })
    isFollowings: User;

    @ManyToOne(() => User, (user) => user.userIsFollower)
    @JoinColumn({
        name: 'follow_id',
    })
    follower: User;
}
