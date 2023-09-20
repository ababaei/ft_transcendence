import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import {Server, Socket} from 'socket.io';
import { GameService } from "src/games/games.service";
import { PlayersService } from "src/players/players.service";

@WebSocketGateway({
cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
})

export class MyGateway {

    constructor (private readonly gameService: GameService,
                 private readonly playerService: PlayersService) {}

    @WebSocketServer()
    server: Server;
    users: [];

    handleConnection(client: Socket) {
        console.log(`Client connected : ${client.id}`);
        this.server.to(`${client.id}`).emit('socketRef', `${client.id}`)
    }

    @SubscribeMessage('keypress')
    handleKeyPress(client: Socket, data: string): any {
        console.log(data);
        if (data=='ArrowUp')
            this.server.to(`${client.id}`).emit('KeyPressed', 'Up');
        if (data=='ArrowDown')
            this.server.to(`${client.id}`).emit('KeyPressed', 'Down');
    }

    @SubscribeMessage('initGame')
    async InitGame(client: Socket, data: any): Promise<any> {
        const game = await this.gameService.initGame();

        const player1 = await this.playerService.newPlayer(game, data[0].socket);
        const player2 = await this.playerService.newPlayer(game, data[1].socket);

        this.server.to(data[0].socket).emit('gameStarted', game.id);
        this.server.to(data[1].socket).emit('gameStarted', game.id);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected : ${client.id}`)
    }

}