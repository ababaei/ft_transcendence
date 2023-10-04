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
}