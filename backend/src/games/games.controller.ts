import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { GameService } from "./games.service";
import { Game } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('games')
export class GamesController {

    constructor (private readonly gameService: GameService,
        private readonly prismaService: PrismaService) 
        {}

    
    @Post()
    async createGame() {
        const game = await this.prismaService.game.create({
            data: {
                active: false,
                status: 0,
            }
        })
        return game;
    }

    @Put('accept/:id')
    async acceptDuel(@Param() params: { id: string }) {
        console.log(params.id)
        await this.prismaService.game.update({
            where: {id:parseInt(params.id)},
            data: {
                status: 1,
            }
        })
    }

    @Put('refuse/:id')
    async refuseDuel(@Param() params: { id: string }) {
        
        await this.prismaService.game.update({
            where: {id:parseInt(params.id)},
            data: {
                status: 2,
            }
        })
    }
    
    @Get('/:id')
    async getGames(@Param() params: { id: string }) {
        const game = await this.prismaService.game.findUnique({
            where: {id: parseInt(params.id)},
            include: {Players: true}
        })
        return (game);
    }
}

    // @Post()
    // async addGame(@Body() data: Game): Promise<Game>{
    //     return this.gameService.createGame(data)
    // }