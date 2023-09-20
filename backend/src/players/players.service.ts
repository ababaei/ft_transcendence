import { Inject, Injectable } from "@nestjs/common";
import { Game, Player } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

export class PlayersService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
        ) {}

    async getAllPlayers(): Promise<Player[]>{
        return this.prisma.player.findMany({})
    }

    // async getPlayer(socket:string): Promise<Player | null>{
    //     return this.prisma.player.findUnique({where: {socket:socket}})
    // }

    async createPlayer(data: Player): Promise<Player>{
        return this.prisma.player.create({
            data
        })
    }

    async newPlayer(game: Game, socket: string): Promise<Player>{
        const newPlayer = await this.prisma.player.create({
            data: {
                socket: socket,
                game: {
                    connect: {
                        id: game.id
                    }
                }
            }
        });
        return newPlayer;
    }

    async deletePlayer(id:string): Promise<Player>{
        return this.prisma.player.delete({
            where: {id:parseInt(id)}
        })
    }

    async countPlayers(){
        const nb = this.prisma.player.count();
        return nb;
    }
}