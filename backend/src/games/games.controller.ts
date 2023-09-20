import { Body, Controller, Post } from "@nestjs/common";
import { GameService } from "./games.service";
import { Game } from "@prisma/client";

@Controller('games')
export class GamesController {

    constructor (private readonly gameService: GameService) {}

    @Post()
    async addGame(@Body() data: Game): Promise<Game>{
        return this.gameService.createGame(data)
    }
}