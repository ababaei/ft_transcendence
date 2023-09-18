import { Body, Controller, Get, Next, Post, Req, Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as passport from 'passport';
import { NextFunction, Request, Response } from 'express';
// import { SchoolStrategy } from './strategy/school.strategy';



@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @Get('42')
    login(
        @Res() res: Response,
        @Req() req: Request,
        @Next() next: NextFunction
        ) {
        console.log('authenticate_')
        const handler = passport.authenticate('42');
        return handler(res, req, next); 
    }

    @Get('logout')
    logout() {}

    // @Post('signup')
    // signup(@Body() dto: AuthDto) {
    //     return this.authService.signup(dto);
    // }

    // @Post('signin')
    // signin(@Body() dto: AuthDto) {
    //     return this.authService.signin(dto);
    // }
}