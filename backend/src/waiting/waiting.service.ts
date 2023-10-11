import { Inject } from "@nestjs/common";
import { Waiting } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


export class WaitingService {

    constructor(@Inject(PrismaService)
        private prisma: PrismaService,
    ) {}

    async getAllWaiting(): Promise<Waiting[]>{
        return this.prisma.waiting.findMany({})
    }

    async getWaiting(socket:string): Promise<Waiting | null>{
        return this.prisma.waiting.findUnique({where: {socket:socket}})
    }

    async createWaiting(data: Waiting): Promise<Waiting>{
        return this.prisma.waiting.create({
            data
        })
    }

    async deleteWaiting(id:string): Promise<Waiting>{
        return this.prisma.waiting.delete({
            where: {id:parseInt(id)}
        })
    }

    async countWaiting() {
        const nb = this.prisma.waiting.count();
        return nb;
    }
}