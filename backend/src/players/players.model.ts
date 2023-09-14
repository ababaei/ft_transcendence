import { Prisma } from "@prisma/client";

export class Players implements Prisma.PlayersInLineCreateInput{
    id: string;
    pos: number;
}