import { PlayersService } from "./players.service";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { Player, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('player')
export class PlayersController {

    constructor (private readonly playersService: PlayersService,
        private readonly prismaService: PrismaService){}

    // @Get()
    // async getAllPlayers():Promise<Player[]>{
    //     return this.playersService.getAllPlayers()
    // }

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
    // async addPlayer(@Body() data: Player):Promise<Player>{
    //     return this.playersService.createPlayer(data)
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