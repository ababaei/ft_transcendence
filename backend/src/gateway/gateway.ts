import { Global } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server, Socket} from 'socket.io';
import { ChatService } from "src/chat/chat.service";
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway({
cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
})
@Global()
export class MyGateway {
    constructor (private chatService: ChatService) {}
    @WebSocketServer()
    server: Server;

    // async handleConnection(client: Socket) {
    //     await client.emit('updateChannelList', await this.chatService.getChannelsList());
    // }
    async handleConnection(client: Socket) {
        console.log(`Client connected : ${client.id}`);
        // this.server.to(`${client.id}`).emit('socketRef', `${client.id}`)
        console.log('socket.io: emit updateChanList');
        const userList = await this.chatService.getUsersList();
        const channelList = await this.chatService.getChannelsList();
        this.server.emit('updateUsersList', userList);
        this.server.emit('updateChannelList', channelList);
    }

    handleDisconnect(client: Socket) {
    //    console.log(`Client disconnected : ${client.id}`)
    }


}