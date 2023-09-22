import { Inject } from "@nestjs/common";
import { Game } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


export class GameService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
    ){}

    async findGame(id: number): Promise<Game[] | null> {
        return this.prisma.game.findMany({
            where: {
                id: id
            },
            include: {
                PlayersID: true
            }
        })
    }

    async createGame(data: Game): Promise<Game> {
        return this.prisma.game.create({
            data
        })
    }

    async initGame(): Promise<Game> {
        return this.prisma.game.create({
            data:{}
        })
    }
}