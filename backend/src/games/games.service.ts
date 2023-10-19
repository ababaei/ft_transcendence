import { Inject } from "@nestjs/common";
import { Game } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export class GameService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
    ){}

    // async findGame(id: number): Promise<Game[] | null> {
    //     return this.prisma.game.findMany({
    //         where: {
    //             id: id
    //         },
    //         include: {
    //             PlayersID: true
    //         }
    //     })
    // }

    // async createGame(data: Game): Promise<Game> {
    //     return this.prisma.game.create({
    //         data
    //     })
    // }

    async updateGame(id: number, leftPlayerScore: number, rightPlayerScore: number){
        console.log("id : ",id);
        console.log("left score : ", leftPlayerScore);
        console.log("right score : ", rightPlayerScore)
        await this.prisma.game.update({
            where: {id: id},
            data: {
                scoreLeft: leftPlayerScore,
                scoreRight: rightPlayerScore
            }
        })
    }

    async initGame(): Promise<Game> {
        return this.prisma.game.create({
            data:{
                scoreLeft: 0,
                scoreRight: 0
            }
        })
    }
}

export class Paddle {
    id: string
    x: number
    y: number
    roomNo: number
    playerNo: number
    up: boolean
    down: boolean

    constructor(id: string, x: number, y: number, roomNo: number, playerNo: number){
        this.id = id;
        this.x = x;
        this.y = y;
        this.roomNo = roomNo;
        this.playerNo = playerNo;
        this.up = false;
        this.down = false
    }

}

export class Ball {
    x: number
    y: number

    constructor(){
        this.x = 200;
        this.y = 200
    }
    
}
