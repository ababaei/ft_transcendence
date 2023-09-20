import { PlayersService } from "./players.service";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { Player } from "@prisma/client";

@Controller('pong')
export class PlayersController {

    constructor (private readonly playersService: PlayersService){}

    @Get()
    async getAllPlayers():Promise<Player[]>{
        return this.playersService.getAllPlayers()
    }

    @Get('/waiting')
    async countPlayers(){
        return this.playersService.countPlayers()
    }

    @Post()
    async addPlayer(@Body() data: Player):Promise<Player>{
        return this.playersService.createPlayer(data)
    }

    // @Get(':socket')
    // async getPlayer(@Param('socket') socket:string):Promise<Player | null>{
    //     return this.playersService.getPlayer(socket)
    // }

    @Delete(':id')
    async deletePlayer(@Param('id') id:string):Promise<Player>{
        return this.playersService.deletePlayer(id)
    }
}