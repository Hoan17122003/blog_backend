import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly userService: UserService,
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { sender: number; receiver: number; content: string }) {
        const { sender, receiver, content } = payload;
        const message = await this.chatService.saveMessage(content, { id: sender } as any, { id: receiver } as any);
        this.server.emit('receiveMessage', message);
    }

    @SubscribeMessage('typing')
    handleTyping(client: Socket, payload: { sender: number; receiver: number }) {
        this.server.emit('typing', payload);
    }
}
