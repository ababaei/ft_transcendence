import { Module } from "@nestjs/common";
import { MyPonGateway } from "./Pongateway";
import { Ball, GameService, Paddle } from "src/games/games.service";
import { PlayersService } from "src/players/players.service";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { Paddles } from "./gateway.service";
import { ScheduleModule } from "@nestjs/schedule";
import { GameModule } from "src/games/games.module";

@Module({
    imports: [ScheduleModule.forRoot(), GameModule],
    providers: [MyPonGateway, GameService, PlayersService, PrismaService, Paddle, Ball],
})
export class GatewayPongModule {}