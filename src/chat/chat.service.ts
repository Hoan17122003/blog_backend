import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chat } from 'src/database/Entity/chat.entity';
import { User } from 'src/database/Entity/user.entity';

@Injectable()
export class ChatService {
    constructor(
        @Inject('CHATREPOSITORY')
        private messageRepository: Repository<Chat>,
    ) {}

    async saveMessage(content: string, sender: User, receiver: User): Promise<Chat> {
        const message = this.messageRepository.create({ content, sender, receiver });
        return this.messageRepository.save(message);
    }

    async getMessages(senderId: number, receiverId: number): Promise<Chat[]> {
        return this.messageRepository.find({
            where: [
                { sender: { user_id: senderId }, receiver: { user_id: receiverId } },
                { sender: { user_id: receiverId }, receiver: { user_id: senderId } },
            ],
            relations: ['sender', 'receiver'],
            order: {
                date_sent: 'ASC',
            },
        });
    }
}
