import { Global } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import {Server, Socket} from 'socket.io';
import { ChatService } from "src/chat/chat.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "src/games/games.service";
import { PlayersService } from "src/players/players.service";
import { Paddles } from "./gateway.service";
import { Interval } from "@nestjs/schedule";

@WebSocketGateway({
cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
})

export class MyGateway {
  playerNo : number
  player: {
    id: string,
    x: number,
    y: number,
    roomNo :string,
    score: number,
    side: string,
    up: boolean,
    down: boolean,
    active: boolean
  }[] = []
  ball: {
    roomNo: string,
    x: number,
    y: number,
    size: number,
    speed: number,
    velX: number,
    velY: number
  }[] = []
  canvas: {
    width: number,
    height: number
  } = {
    width: 750,
    height: 300
  }
  paddle: {
    height: number,
    width: number
  } = {
    height: 80,
    width: 15
  }

    constructor (private readonly gameService: GameService,
                 private readonly playerService: PlayersService) {
                  this.playerNo = 0
                }

    @WebSocketServer()
    server: Server;
    
    collision(ball: any, player: any)
    {
      let coll = false
      const p_top = player.y;
      const p_bottom = player.y + this.paddle.height;
      const p_left = player.x;
      const p_right = player.x + this.paddle.width;

      const b_top = ball.y - ball.size;
      const b_bottom = ball.y + ball.size;
      const b_left = ball.x - ball.size;
      const b_right = ball.x + ball.size;

      if (b_left < p_right && b_right > p_left && b_top < p_bottom && b_bottom > p_top)
        coll = true;
      return (coll);
    }

    score(element: any, leftPlayer: any, rightPlayer: any)
    {
      if (element.x < 0)
      {
        rightPlayer.score++;
        return (true);
      }
      else if (element.x > this.canvas.width)
      {
        leftPlayer.score++;
        return (true);
      }
      else
        return (false)
    }

    reinitEl(element: any)
    {
      element.x = 350;
      element.y = 150;
      element.velY = 0;
      element.velX = 1;
    }

    @Interval(15)
    serverLoop(){
      if (this.playerNo > 0) {
        this.player.forEach(element => {
          if (element.up)
            element.y >= 7 ? element.y -= 5 : element.y = 2;
          if (element.down)
            element.y <= 213 ? element.y += 5 : element.y = 218;
          this.server.to(element.roomNo).emit('posUpdate', element);
        },
        this.ball.forEach(element => {
          const leftPlayer = this.player.filter(e => e.roomNo == element.roomNo && e.side == 'left')[0];
          const rightPlayer = this.player.filter(e => e.roomNo == element.roomNo && e.side == 'right')[0];
          element.x += element.velX;
          element.y += element.velY;
          if (element.y + element.size > this.canvas.height
            || element.y - element.size <= 0)
              element.velY *= -1;
          if (this.collision(element, rightPlayer) || this.collision(element, leftPlayer))
          {
            element.velX *= -1;
            let collidePoint = 0;
            if (this.collision(element, rightPlayer))
              collidePoint = element.y - (rightPlayer.y + this.paddle.height/2) / (this.paddle.height / 2);
            else
              collidePoint = element.y - (leftPlayer.y + this.paddle.height/2) / (this.paddle.height / 2);
            const angle = collidePoint * Math.PI / 4;
            const newVelY = element.speed * Math.sin(angle);
            if ((newVelY > 0 && element.velY < 0)
              || (newVelY < 0 && element.velY > 0))
              element.velY = -newVelY;
            else
              element.velY = newVelY;
          }
          if (this.score(element, leftPlayer, rightPlayer))
          {
            this.server.to(element.roomNo).emit('goal', leftPlayer, rightPlayer);
            this.reinitEl(element);
          }
          element.y += element.velY;
          element.x += element.velX;
          this.server.to(element.roomNo).emit('ballPos', element)
        })
        );
      }
    }

    handleConnection(client: Socket) {
        console.log(`Client connected : ${client.id}`);
        this.server.to(`${client.id}`).emit('socketRef', `${client.id}`);
    }

    @SubscribeMessage('newPlayer')
    playerJoinRoom(client: Socket) {
      this.playerNo++;
      let roomNo = Math.round(this.playerNo / 2).toString();
      client.join(roomNo);
      if(this.playerNo % 2 === 1){
        const newPlayer = {
          id: client.id,
          x: 4,
          y: 110,
          roomNo: roomNo,
          score: 0,
          side: 'left',
          up: false,
          down: false,
          active: false
        }
        this.player.push(newPlayer);
      }
      if(this.playerNo % 2 === 0){
        const newPlayer = {
          id: client.id,
          x: 681,
          y: 110,
          roomNo : roomNo,
          score: 0,
          side: 'right',
          up: false,
          down: false,
          active: false
        }
        this.player.push(newPlayer);
        const newBall = {
          roomNo: roomNo,
          x: 350,
          y: 150,
          size: 5,
          speed: 2,
          velX: 2,
          velY: 0
        }
        this.ball.push(newBall)
        this.server.to(roomNo).emit('initBall', newBall);
        let roomPlayers = [];
        this.player.forEach(element => {
          if (element.roomNo === roomNo)
          {
            element.active = true;
            roomPlayers.push(element)
          }
        });
        this.server.to(roomPlayers[0].roomNo).emit('initGame', roomPlayers);
        
      }
      // const result = this.player.find(({id}) => id === client.id);
    }

    @SubscribeMessage('keypress')
    updatePaddle(client:Socket, data: any) {
      const player = this.player.find(({id}) => id === client.id);
      if (player.active == true) {
        player.up = data.up;
        player.down = data.down;
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

    async handleDisconnect(client: Socket) {
        console.log(`Client disconnected : ${client.id}`)
        const player = await this.playerService.getPlayer(`${client.id}`)
        // console.log(player);
        if (player)
        {
            const players = await this.playerService.getPlayers(player.gameID);
            this.server.to(players[0].socket).emit('gameEnded');
            this.server.to(players[1].socket).emit('gameEnded');    
        }
    }


}