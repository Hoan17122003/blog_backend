import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('messages/:senderId/:receiverId')
    async getMessages(@Param('senderId') senderId: number, @Param('receiverId') receiverId: number) {
        return this.chatService.getMessages(senderId, receiverId);
    }
}
