import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports:[PrismaModule],
    providers: [MyGateway],
})
export class GatewayModule {}