import { Inject, Injectable } from "@nestjs/common";
import { Game, Player } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export class PlayersService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
        ) {}

    async getPlayers(id: number): Promise<Player[]>{
        return this.prisma.player.findMany({
            where: {gameID:id}
        })
    }

    // async getPlayer(socket: string): Promise<Player | null>{
    //     return this.prisma.player.findUnique({where: {socket:socket}})
    // }

    async createPlayer(gameID: number, userID: number, side: string): Promise<Player>{
        const player = await this.prisma.player.create({
            data: {
                gameID: gameID,
                userID: userID,
                score: 0,
                side: side
            }
        })
        return player;
    }

    async updatePlayer(gameID: number, side:string, score: number): Promise<Player>{
        const updatedPlayer = await this.prisma.player.updateMany({
            where: {gameID: gameID,
                side: side},
            data: {score:score}
        })
        return updatedPlayer[0];
    }

    // async newPlayer(game: Game, socket: string): Promise<Player>{
    //     const newPlayer = await this.prisma.user.update({
    //         data: {
    //             game: {
    //                 connect: {
    //                     id: game.id
    //                 }
    //             }
    //         }
    //     });
    //     return newPlayer;
    // }

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