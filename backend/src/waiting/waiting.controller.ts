import { Body, Controller, Delete, Get, Header, Param, Post } from "@nestjs/common";
import { Waiting } from "@prisma/client";
import { WaitingService } from "./waiting.service";

@Controller('pong')
export class WaitingController {

    constructor (private readonly waitingService: WaitingService){}

    @Get()
    @Header('Access-Control-Allow-Origin', 'true')
    async getAllWaiting():Promise<Waiting[]>{
        return this.waitingService.getAllWaiting()
    }

    @Delete(':id')
    @Header('Access-Control-Allow-Origin', 'true')
    async deleteWaiting(@Param('id') id:string): Promise<Waiting>{
        return this.waitingService.deleteWaiting(id)
    }

    @Get(':socket')
    @Header('Access-Control-Allow-Origin', 'true')
    async getPlayer(@Param('socket') socket:string):Promise<Waiting | null>{
        return this.waitingService.getWaiting(socket)
    }

    // @Get('/waiting')
    // async countWaiting(){
    //     return this.waitingService.countWaiting()
    // }

    @Post()
    @Header('Access-Control-Allow-Origin', 'true')
    async addWaiting(@Body() data: Waiting): Promise<Waiting>{
        return this.waitingService.createWaiting(data)
    }

}