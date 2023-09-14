import { PlayersService } from "./players.service";
import { Players } from "./players.model";
import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";

@Controller()
export class PlayersController {

    constructor (private readonly playersService: PlayersService){}

    @Get()
    async getAllPlayers():Promise<Players[]>{
        return this.playersService.getAllPlayers()
    }

    @Post()
    async addPlayer(@Body() data: Players):Promise<Players>{
        return this.playersService.createPlayer(data)
    }

    @Get(':id')
    async getPlayer(@Param('id') id:string):Promise<Players | null>{
        return this.playersService.getPlayer(id)
    }

    @Delete(':id')
    async deletePlayer(@Param('id') id:string):Promise<Players>{
        return this.playersService.deletePlayer(id)
    }
}