import { Prisma } from "@prisma/client";


export class Games implements Prisma.GamesCreateInput{
    id: number;
    Player1: string;
    Player2: string;
}