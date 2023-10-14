import { Module } from "@nestjs/common";
import { GamesController } from "./games.controller";
import { GameService } from "./games.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [GamesController],
    providers: [GameService, PrismaService]
})
export class GameModule{}