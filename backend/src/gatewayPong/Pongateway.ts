import { Global } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Prisma } from "@prisma/client";
import {Server, Socket} from 'socket.io';
import { ChatService } from "src/chat/chat.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "src/games/games.service";
// import { PlayersService } from "src/players/players.service";
import { Paddles } from "./gateway.service";
import { Interval } from "@nestjs/schedule";
import { UsersService } from "src/users/users.service";
import { PlayersService } from "src/players/players.service";

@WebSocketGateway({
cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
})
@Global()
export class MyPonGateway {
  playerNo : number
  privateNo : number
  player: {
    id: string,
    socket: string,
    x: number,
    y: number,
    roomNo :string,
    score: number,
    side: string,
    up: boolean,
    down: boolean,
    active: boolean,
    waiting: boolean
  }[] = []
  privatePlayer: {
    id: string,
    socket: string,
    x: number,
    y: number,
    roomNo :string,
    score: number,
    side: string,
    up: boolean,
    down: boolean,
    active: boolean,
  }[] = []
  ball: {
    gameNo: number,
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
    width: 600,
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
                private readonly userService: UsersService,
                private readonly playerService: PlayersService,
                private readonly prisma:PrismaService) {
                  this.playerNo = 0,
                  this.privateNo = 0
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
      if (b_bottom > p_top)
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
      element.x = this.canvas.width / 2;
      element.y = this.canvas.height / 2;
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
          if (element.active == true)
            this.server.to(element.roomNo).emit('posUpdate', element);
        },
        this.ball.forEach(element => {
          const leftPlayer = this.player.filter(e => e.roomNo == element.roomNo && e.side == 'left' && e.active == true)[0];
          const rightPlayer = this.player.filter(e => e.roomNo == element.roomNo && e.side == 'right' && e.active == true)[0];
          if (leftPlayer && rightPlayer)
          {
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
              if (leftPlayer.score === 3 || rightPlayer.score === 3)
              {
                var winner = null;
                leftPlayer.score === 3 ? winner = leftPlayer : winner = rightPlayer;
                this.server.to(element.roomNo).emit('Winner', winner);
                this.playerService.updatePlayer(element.gameNo, 'left', leftPlayer.score);
                this.playerService.updatePlayer(element.gameNo, 'right', rightPlayer.score);
                this.gameService.updateGame(element.gameNo, winner.id);
                leftPlayer.active = false;
                rightPlayer.active = false;
                return;
              }
            }
            element.y += element.velY;
            element.x += element.velX;
            this.server.to(element.roomNo).emit('ballPos', element)
          }
        })
        );
      }
    }

    @Interval(15)
    privateLoop(){
      if (this.privateNo > 0) {
        this.privatePlayer.forEach(element => {
          if (element.up)
            element.y >= 7 ? element.y -= 5 : element.y = 2;
          if (element.down)
            element.y <= 213 ? element.y += 5 : element.y = 218;
          if (element.active == true)
            this.server.to(element.roomNo).emit('posUpdate', element);
        },
        this.ball.forEach(element => {
          // console.log('filterleft : ', this.privatePlayer.filter(e => e.roomNo == element.roomNo && e.side == 'left' && e.active == true))
          const leftPlayer = this.privatePlayer.filter(e => e.roomNo == element.roomNo && e.side == 'left' && e.active == true)[0];
          const rightPlayer = this.privatePlayer.filter(e => e.roomNo == element.roomNo && e.side == 'right' && e.active == true)[0];
          // console.log(leftPlayer, rightPlayer)
          if (leftPlayer && rightPlayer)
          {
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
              if (leftPlayer.score === 3 || rightPlayer.score === 3)
              {
                console.log('leftPlayer', leftPlayer);
                console.log('rightPlayer', rightPlayer);
                var winner = null;
                leftPlayer.score === 3 ? winner = leftPlayer : winner = rightPlayer;
                this.server.to(element.roomNo).emit('Winner', winner);
                this.playerService.updatePlayer(element.gameNo, 'left', leftPlayer.score);
                this.playerService.updatePlayer(element.gameNo, 'right', rightPlayer.score);
                this.gameService.updateGame(element.gameNo, winner.id);
                console.log('winnerID : ', winner.id)
                this.prisma.game.update({where: {id:element.gameNo}, data: {status: 3}})
                leftPlayer.active = false;
                rightPlayer.active = false;
                return;
              }
            }
            element.y += element.velY;
            element.x += element.velX;
            this.server.to(element.roomNo).emit('ballPos', element)
          }
        })
        );
      }
    }

    handleConnection(client: Socket) {
      // console.log(`Pong Client connected : ${client.id}`);
      this.server.to(`${client.id}`).emit('socketRef', `${client.id}`);
    }

    @SubscribeMessage('privateGame')
    async privateGame(client: Socket, data: any) {
      this.privateNo++;
      const gameID = data[0];
      const userID = data[1];
      const side = data[2];
      var newPlayer
      client.join('private' + gameID);
      const room = 'private' + gameID as string
      // console.log('room = ', room)
      const game = await this.prisma.game.findUnique({where: {id:parseInt(gameID)}})
      const status = await this.prisma.game.findUnique({where: {id:parseInt(gameID)}})
      if (side == 'left')
      {
      newPlayer = {
        id: userID,
        socket: client.id,
        x: 4,
        y: 110,
        roomNo: room,
        score: 0,
        side: side,
        up: false,
        down: false,
        active: false,
      }
    }
    else {
      newPlayer = {
        id: userID,
        socket: client.id,
        x: 581,
        y: 110,
        roomNo: room,
        score: 0,
        side: side,
        up: false,
        down: false,
        active: false,
      }
    }
      this.privatePlayer.push(newPlayer);
      if (status.status == 1)
      {
        const newBall = {
          gameNo: parseInt(gameID),
          roomNo: room,
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          size: 5,
          speed: 2,
          velX: 2,
          velY: 0
        }
        this.ball.push(newBall);
        this.server.to(room).emit('initBall', newBall);
        this.privatePlayer.forEach(element => {
          if (element.roomNo === room)
          {
            this.userService.addGame(game, parseInt(element.id))
            element.active = true;
          }
        });
        this.server.to(newPlayer.roomNo).emit('initGame');
      }
    }

    @SubscribeMessage('newPlayer')
    async playerJoinRoom(client: Socket, userID: string) {
      const player = this.player.findIndex(item => {
        return (item.id === userID && item.waiting === true)
      })
      if (player != -1)
        this.server.to(client.id).emit('alreadyWaiting');
      else
      {
        this.playerNo++;
        let roomNo = Math.round(this.playerNo / 2).toString();
        client.join(roomNo);
        if(this.playerNo % 2 === 1){
          const newPlayer = {
            id: userID,
            socket: client.id,
            x: 4,
            y: 110,
            roomNo: roomNo,
            score: 0,
            side: 'right',
            up: false,
            down: false,
            active: false,
            waiting: true
          }
          this.player.push(newPlayer);
        }
        if(this.playerNo % 2 === 0){
          const newPlayer = {
            id: userID,
            socket: client.id,
            x: 581,
            y: 110,
            roomNo : roomNo,
            score: 0,
            side: 'left',
            up: false,
            down: false,
            active: false,
            waiting: true
          }
          this.player.push(newPlayer);
          const game = await this.gameService.initGame()
          const newBall = {
            gameNo: game.id,
            roomNo: roomNo,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 5,
            speed: 2,
            velX: 2,
            velY: 0
          }
          this.ball.push(newBall);
          this.server.to(roomNo).emit('initBall', newBall);
          this.player.forEach(element => {
            if (element.roomNo === roomNo)
            {
              this.playerService.createPlayer(game.id, parseInt(element.id), element.side)
              this.userService.addGame(game, parseInt(element.id))
              element.waiting = false;
              element.active = true;
            }
          });
          this.server.to(roomNo).emit('initGame');
        }
      }
    }

    @SubscribeMessage('deletePlayer')
    deletePlayer(client:Socket){
        const player = this.player.findIndex(item => {
          return (item.socket === client.id && item.waiting === true)
        })
        if (player != -1)
        {
          this.playerNo--;
          this.player.splice(player, 1);
        }
    }

    @SubscribeMessage('pageChanged')
    async forceDisconnection(client:Socket) {
      var playerIndex = this.player.findIndex(item => {
        return (item.socket === client.id && (item.active == true || item.waiting == true))
      });
      if (playerIndex != -1)
      {
        var looserID:number
        var winnerID:number
        if (this.player[playerIndex].active == true)
        {
          this.player.forEach(element => {
            if (element.roomNo == this.player[playerIndex].roomNo)
            element.active = false;
            if (element.socket == client.id)
              looserID = parseInt(element.id)
            else
              winnerID = parseInt(element.id)
            });
          const ball = this.ball.find(item => {
            return (item.roomNo === this.player[playerIndex].roomNo)
          })
          await this.playerService.updateUnfinished(ball.gameNo, winnerID, 3);
          await this.playerService.updateUnfinished(ball.gameNo, looserID, 0);
          await this.gameService.updateGame(ball.gameNo, winnerID);
          this.server.to(this.player[playerIndex].roomNo).emit('forceEndGame');
        }
        if (this.player[playerIndex].waiting == true)
        {
          this.playerNo--;
          this.player.splice(playerIndex, 1);
        }
      }
      else {
        playerIndex = this.privatePlayer.findIndex(item => {
          return (item.socket === client.id && item.active === true)
        })
        if (playerIndex != -1)
        {
          var looserID:number
          var winnerID:number
          const ball = this.ball.find(item => {
            return (item.roomNo === this.privatePlayer[playerIndex].roomNo)
          })
          const game = this.prisma.game.findUnique({where: {id:ball.gameNo}});
          if ((await game).status == 0)
          {
            await this.prisma.game.update({where: {id:ball.gameNo}, data: {status: 3}})
            client.disconnect(true);
            return;
          } 
          this.privatePlayer.forEach(element => {
            if (element.roomNo == this.privatePlayer[playerIndex].roomNo)
            element.active = false;
            if (element.socket == client.id)
              looserID = parseInt(element.id)
            else
              winnerID = parseInt(element.id)
            });
          await this.playerService.updateUnfinished(ball.gameNo, winnerID, 3);
          await this.playerService.updateUnfinished(ball.gameNo, looserID, 0);
          await this.gameService.updateGame(ball.gameNo, winnerID);
          this.prisma.game.update({where: {id:ball.gameNo}, data: {status: 3}})
          this.server.to(this.privatePlayer[playerIndex].roomNo).emit('forceEndGame');  
        }
      }
      client.disconnect(true);
    }

    @SubscribeMessage('keypress')
    updatePaddle(client:Socket, data: any) {
      const player = this.player.find(item => {
        return (item.socket === client.id && item.active === true)
      });
      if (player) {
        player.up = data.up;
        player.down = data.down;
      }
      else 
      {
        const privateplayer = this.privatePlayer.find(item => {
        return (item.socket === client.id && item.active === true)
        })
        if (privateplayer) {
          privateplayer.up = data.up;
          privateplayer.down = data.down;
        }
      }
    }


    async handleDisconnect(client: Socket) {
        // console.log(`Client disconnected : ${client.id}`)
        const playerIndex = this.player.findIndex(item => {
          return (item.socket === client.id && (item.active == true || item.waiting == true))
        });
        if (playerIndex != -1)
        {
          var looserID:number
          var winnerID:number
          if (this.player[playerIndex].active == true)
          {
            this.player.forEach(element => {
              if (element.roomNo == this.player[playerIndex].roomNo)
              element.active = false;
              if (element.socket == client.id)
                looserID = parseInt(element.id)
              else
                winnerID = parseInt(element.id)
              });
            const ball = this.ball.find(item => {
              return (item.roomNo === this.player[playerIndex].roomNo)
            })
            await this.playerService.updateUnfinished(ball.gameNo, winnerID, 3);
            await this.playerService.updateUnfinished(ball.gameNo, looserID, 0);
            await this.gameService.updateGame(ball.gameNo, winnerID);
            this.server.to(this.player[playerIndex].roomNo).emit('forceEndGame');
          }
          if (this.player[playerIndex].waiting == true)
          {
            this.playerNo--;
            this.player.splice(playerIndex, 1);
          }
        }
        else {
          console.log('client id', client.id);
          const privateIndex = this.privatePlayer.findIndex(item => {
            return (item.socket === client.id && item.active == true)
          })
          if (privateIndex != -1)
          {
            var looserID:number
            var winnerID:number
            const ball = this.ball.find(item => {
              return (item.roomNo === this.privatePlayer[playerIndex].roomNo)
            })
            const game = this.prisma.game.findUnique({where: {id:ball.gameNo}});
            if ((await game).status == 0)
            {
              await this.prisma.game.update({where: {id:ball.gameNo}, data: {status: 3}})
              client.disconnect(true);
              return;
            }   
            this.privatePlayer.forEach(element => {
              if (element.roomNo == this.privatePlayer[privateIndex].roomNo)
                element.active = false;
              if (element.socket == client.id)
                looserID = parseInt(element.id)
              else
                winnerID = parseInt(element.id)
            });
            await this.playerService.updateUnfinished(ball.gameNo, winnerID, 3);
            await this.playerService.updateUnfinished(ball.gameNo, looserID, 0);
            await this.gameService.updateGame(ball.gameNo, winnerID);
            this.prisma.game.update({where: {id:ball.gameNo}, data: {status: 3}})
            this.server.to(this.privatePlayer[privateIndex].roomNo).emit('forceEndGame');
            console.log('fin 1er element');
          }
        }
  
    }


}