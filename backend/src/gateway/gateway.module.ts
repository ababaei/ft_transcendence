import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { PrismaModule } from "src/prisma/prisma.module";
import { ChatService } from "src/chat/chat.service";

@Module({
    imports:[],
    providers: [MyGateway, ChatService],
})
export class GatewayModule {}