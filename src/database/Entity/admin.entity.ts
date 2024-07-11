import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Admin')
export class Admin {
    @PrimaryColumn({
        name: 'admin_id',
        type: 'int',
    })
    admin_id: number;

    // @OneToOne(() => User, (user) => user.admin, {
    //     cascade: true,
    // })
    // @JoinColumn({
    //     name: 'admin_id',
    // })
    // user: User;
}
