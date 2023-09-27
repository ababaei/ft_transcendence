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
        // console.log(`Client connected : ${client.id}`);
        this.server.to(`${client.id}`).emit('socketRef', `${client.id}`);
    }

    @SubscribeMessage('updateSocket')
    async updateSocket(client: Socket, data: string): Promise<any> {
        const player = await this.playerService.getPlayer(data);
        this.playerService.updatePlayer(player, `${client.id}`);
    }

    @SubscribeMessage('keypress')
    async handleKeyPress(client: Socket, data: any): Promise<any> {
        const players = await this.playerService.getPlayers(data[1]);
        if (players[0] != null)
        {
            if (`${client.id}` == players[0].socket)
                var side = "left";
            else
                var side = "right";
            if (data[0]=='ArrowUp')
            {
                if (side == "left")
                    data[2].left.y > 7 ? data[2].left.y -= 5 : data[2].left.y = 2;
                else
                    data[2].right.y > 7 ? data[2].right.y -=5 : data[2].right.y = 2;
                this.server.to(players[0].socket).emit('KeyPressed', data[2]);
                this.server.to(players[1].socket).emit('KeyPressed', data[2]);
            }
            if (data[0]=='ArrowDown')
            {
                if (side == "left")
                    data[2].left.y < 213 ? data[2].left.y +=5 : data[2].left.y = 218;
                else
                    data[2].right.y < 213 ? data[2].right.y +=5 : data[2].right.y = 218;
                this.server.to(players[0].socket).emit('KeyPressed', data[2]);
                this.server.to(players[1].socket).emit('KeyPressed', data[2]);
            }
        }
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