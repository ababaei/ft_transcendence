import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { GameService } from "./games.service";
import { Game } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('games')
export class GamesController {

    constructor (private readonly gameService: GameService,
        private readonly prismaService: PrismaService) 
        {}

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