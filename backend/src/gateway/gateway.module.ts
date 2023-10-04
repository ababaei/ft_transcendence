import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { Ball, GameService, Paddle } from "src/games/games.service";
import { PlayersService } from "src/players/players.service";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { Paddles } from "./gateway.service";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [MyGateway, GameService, PlayersService, PrismaService, Paddle, Ball],
})
export class GatewayModule {}