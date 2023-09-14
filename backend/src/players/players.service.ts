import { PlayersInLine } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

export class PlayersService {

    constructor(private prisma: PrismaService) {}

    async getAllPlayers(): Promise<PlayersInLine[]>{
        return this.prisma.playersInLine.findMany()
    }

    async getPlayer(socket:string): Promise<PlayersInLine | null>{
        return this.prisma.playersInLine.findUnique({where: {id:socket}})
    }

    async createPlayer(data: PlayersInLine): Promise<PlayersInLine>{
        return this.prisma.playersInLine.create({
            data
        })
    }

    async deletePlayer(socket:string): Promise<PlayersInLine>{
        return this.prisma.playersInLine.delete({
            where: {id:socket}
        })
    }
}