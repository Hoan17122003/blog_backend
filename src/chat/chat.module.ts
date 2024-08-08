import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { unknowProviders } from 'src/database/dynamic-provider';
import { Chat } from 'src/database/Entity/chat.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
    imports: [DatabaseModule],
    providers: [unknowProviders('CHATREPOSITORY', Chat), ChatService, ChatGateway],
    controllers : [ChatController]
})
export class ChatModule {}
