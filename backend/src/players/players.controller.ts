import { PlayersService } from "./players.service";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { Player, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('player')
export class PlayersController {

    constructor (private readonly playersService: PlayersService,
        private readonly prismaService: PrismaService){}

    @Post()
    async addPlayer(@Body() data:any){
        console.log('infos :', data);
        const { gameID, userID, side } = data;
        const newPlayer = await this.prismaService.player.create({
          data: {
            gameID:gameID,
            userID:userID,
            score:0,
            side:side
          }
        });
        return newPlayer;
    }

    @Get('/:gameID/:userID')
    async getPlayer(@Param('gameID') gameID:string, @Param('userID') userID:string)
    {
      const player = await this.prismaService.player.findFirst({
        where: {
          gameID: parseInt(gameID),
          userID: parseInt(userID)
        }
      })
      return player.side
    }

    @Get('/:id')
    async getInfos(@Param('id') id: string): Promise<User>{
      const user = await this.prismaService.user.findUnique({
        where: {id: parseInt(id)}
      })
      return user;
    }

    // @Get('/waiting')
    // async countPlayers(){
    //     return this.playersService.countPlayers()
    // }

    // @Post()
    // async addPlayer(gameID:number, userID:number, side:string):Promise<Player>{
    //     return this.playersService.createPlayer(gameID, userID, side);
    // }

    // @Get(':socket')
    // async getPlayer(@Param('socket') socket:string):Promise<Player | null>{
    //     return this.playersService.getPlayer(socket)
    // }

    // @Delete(':id')
    // async deletePlayer(@Param('id') id:string):Promise<Player>{
    //     return this.playersService.deletePlayer(id)
    // }
}