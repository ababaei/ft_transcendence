import { Module } from "@nestjs/common";
import { WaitingController } from "./waiting.controller";
import { WaitingService } from "./waiting.service";
import { PrismaService } from "src/prisma.service";

@Module({
    controllers: [WaitingController],
    providers: [WaitingService, PrismaService]
})
export class WaitingModule{}