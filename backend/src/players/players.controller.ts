import { PlayersService } from "./players.service";
// import { PlayersInLine } from "./players.model";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { PlayersInLine } from "@prisma/client";

@Controller('pong')
export class PlayersController {

    constructor (private readonly playersService: PlayersService){}

    @Get()
    async getAllPlayers():Promise<PlayersInLine[]>{
        return this.playersService.getAllPlayers()
    }

    @Get('/waiting')
    async countPlayers(){
        return this.playersService.countPlayers()
    }

    @Post()
    async addPlayer(@Body() data: PlayersInLine):Promise<PlayersInLine>{
        return this.playersService.createPlayer(data)
    }

    @Get(':socket')
    async getPlayer(@Param('socket') socket:string):Promise<PlayersInLine | null>{
        return this.playersService.getPlayer(socket)
    }

    @Delete(':socket')
    async deletePlayer(@Param('socket') socket:string):Promise<PlayersInLine>{
        return this.playersService.deletePlayer(socket)
    }
}