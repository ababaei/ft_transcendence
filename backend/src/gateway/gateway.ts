import { Global } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import {Server, Socket} from 'socket.io';

@WebSocketGateway({
cors: {
        origin: ['http://localhost:8080', 'http://localhost:3000/'],
        methods: ["GET", "POST"]
    },
})
@Global()
export class MyGateway {

    @WebSocketServer()
    server: Server;

    // handleConnection(client: Socket) {
    // //    console.log(`Client connected : ${client.id}`)
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