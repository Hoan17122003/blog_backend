import {
    BeforeInsert,
    Check,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import * as argon from 'argon2';

import { Chat } from './chat.entity';
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { UserRole } from 'src/user/enum/user.enum';

@Entity('User')
@Check('isActive >= -1 and isActive <= 1')
@Unique(['username'])
export class User {
    public constructor(username?: string, password?: string, fullname?: string, role?: string, email?: string) {
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.role = role;
        this.email = email;
    }

    public setUser(user: User): void {
        this.username = user.username;
        this.password = user.password;
        this.fullname = user.fullname;
        this.role = user.role;
        this.email = user.email;
    }

    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        name: 'user_id',
    })
    user_id: number;

    @Column({
        type: 'nvarchar',
        length: 100,
    })
    username: string;

    @Column({
        type: 'nvarchar',
        length: 1000,
    })
    password: string;

    @Column({
        type: 'nvarchar',
        length: 30,
    })
    fullname: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: string;

    @Column({
        type: 'nvarchar',
        length: 1000,
        default: null,
    })
    refresh_token: string;

    @Column({
        type: 'blob',
        default: null,
    })
    avatar: string;

    @Column({
        type: 'nvarchar',
    })
    email: string;

    @Column({
        type: 'int',
        default: 0,
        name: 'isActive',
    })
    isActive: number;

    ///////////////////////////////////
    @OneToMany(() => Post, (post) => post.user_wirte)
    @JoinColumn({
        name: 'post_id',
    })
    posts: Post[];

    @OneToMany(() => Chat, (chat) => chat.users_sent)
    @JoinColumn({
        name: 'chat_id',
    })
    chats_sents: Chat[];

    @OneToMany(() => Chat, (chat) => chat.users_received)
    @JoinColumn({
        name: 'chat_id',
    })
    chats_received: Chat[];

    @ManyToMany(() => User)
    @JoinTable({
        name: 'followers',
        joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
        inverseJoinColumn: { name: 'followerId', referencedColumnName: 'user_id' },
    })
    followers: User[];

    @ManyToMany(() => User)
    @JoinTable({
        name: 'following',
        joinColumn: { name: 'followerId', referencedColumnName: 'user_id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
    })
    following: User[];

    @OneToMany(() => Comment, (comment) => comment.user)
    @JoinColumn({
        name: 'comment_id',
    })
    comments: Comment[];
    @BeforeInsert()
    public async hashPassword() {
        const MatKhau = await argon.hash(this.password, {
            hashLength: 200,
        });
        this.password = MatKhau;
    }

    async verifyPassword(MatKhau: string) {
        return await argon.verify(MatKhau, this.password);
    }
}
