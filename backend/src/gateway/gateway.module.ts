import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { GameService } from "src/games/games.service";
import { PlayersService } from "src/players/players.service";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Module({
    providers: [MyGateway, GameService, PlayersService, PrismaService],
})
export class GatewayModule {}