import { Global } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server, Socket} from 'socket.io';
import { ChatService } from "src/chat/chat.service";
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway({
cors: {
        origin: ['http://localhost:8080', 'http://localhost:3000/'],
        methods: ["GET", "POST"]
    },
})
@Global()
export class MyGateway {
    // constructor (private readonly prismaService: PrismaService,
    //     private readonly chatService: ChatService) {}
    @WebSocketServer()
    server: Server;

    // async handleConnection(client: Socket) {
    //     await client.emit('updateChannelList', await this.chatService.getChannelsList());
    // }

    @SubscribeMessage('keypress')
    handleKeyPress(client: Socket, data: string): any {
        console.log(data);
        if (data=='ArrowUp')
            this.server.emit('KeyPressed', 'Up');
        if (data=='ArrowDown')
            this.server.emit('KeyPressed', 'Down');
    }

    handleDisconnect(client: Socket) {
    //    console.log(`Client disconnected : ${client.id}`)
    }


}