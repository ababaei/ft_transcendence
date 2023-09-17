import { ForbiddenException, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        // private config: ConfigService
    ) {}

    login() {
        
    }

    async signup(dto: AuthDto) {
        const hash = await argon.hash(dto.password);
        
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
            });
            return console.log("SIGNED UP");
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        //find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        //if user doesn't exist throw exception
        if (!user) throw new ForbiddenException('Credentials incorrect');
        
        //compare password
        const pwMatches = await argon.verify(user.hash, dto.password);
        //if password doesn't match throw exception
        if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

        return console.log("SIGNED IN");
    }
}