import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "@prisma/client";
import { Profile } from "passport-42"
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor( private prisma: PrismaService ){
        super()
    }

    serializeUser(user: any, done: (err: Error, user: any) => void) {
        // console.log('SERIALIZING USER')
        return done(null, {
            id: user.id,
            name: user.name,
        })
    }

    deserializeUser(user: any, done: (err: Error, user: any) => void) {
        // console.log('SERIALIZING USER')
        const fullUser = this.prisma.user.findUnique({
            where: {
                id: user.id
            }
        })
        return done(null, fullUser);
    }
}