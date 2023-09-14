import { Prisma } from "@prisma/client";

export class PlayersInLine implements Prisma.PlayersInLineCreateInput{
    id: number;
    socket: string;
}