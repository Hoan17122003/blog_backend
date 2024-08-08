import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Chat')
export class Chat {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
        name: 'chat_id',
    })
    chat_id: number;

    @Column({
        name: 'user_sent',
        type: 'int',
    })
    user_sent: number;

    @Column({
        type: 'int',
        name: 'user_received',
    })
    user_received: number;

    @Column({
        type: 'nvarchar',
        length: 600,
        name: 'content',
        default: ' ',
    })
    content: string;

    @Column({
        type: 'timestamp',
        name: 'date_sent',
        default: () => 'CURRENT_TIMESTAMP',
    })
    date_sent: Date;

    @ManyToOne(() => User, (user) => user.chats_sents)
    @JoinColumn({
        name: 'user_id',
    })
    sender: User;

    @ManyToOne(() => User, (user) => user.chats_received)
    @JoinColumn({
        name: 'user_id',
    })
    receiver: User;
}
