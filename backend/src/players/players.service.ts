import { Inject, Injectable } from "@nestjs/common";
import { Game, Player } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

export class PlayersService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
        ) {}

    async getPlayers(id: number): Promise<Player[]>{
        return this.prisma.player.findMany({
            where: {gameID:id}
        })
    }

    async getPlayer(socket: string): Promise<Player | null>{
        return this.prisma.player.findUnique({where: {socket:socket}})
    }

    // async createPlayer(data: Player): Promise<Player>{
    //     return this.prisma.player.create({
    //         data
    //     })
    // }

    async updatePlayer(player: Player, socket: string): Promise<Player>{
        return this.prisma.player.update({
            where: {id:player.id},
            data: {socket:socket}
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

    // async deletePlayer(id:string): Promise<Player>{
    //     return this.prisma.player.delete({
    //         where: {id:parseInt(id)}
    //     })
    // }

    // async countPlayers(){
    //     const nb = this.prisma.player.count();
    //     return nb;
    // }
}