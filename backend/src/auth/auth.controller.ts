import { Body, Controller, Get, Header, Headers, Next, Post, Redirect, Req, Request, Res, Response, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as passport from 'passport';
import { SchoolAuthGuard } from './guards/42auth.guard';
import { AuthGuard } from '@nestjs/passport';
// import { SchoolStrategy } from './strategy/school.strategy';



@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @Get('42')
    @UseGuards(AuthGuard('42'))
    async login() {
        try {
            console.log("dodo")
            passport.authenticate('42')
        } catch(error) {
            console.error(error);
        }
    }

    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    callback(@Request() req: any, @Response() res: any) {
        console.log("_____________________CB__________________")
        passport.authenticate('42', { failureRedirect: '/fail' })
        return;
    }

    @Get('logout')
    logout(@Request() req: any, @Response() res: any) {
        req.logout();
        res.redirect('/');
    }
    // @UseGuards(SchoolAuthGuard
    // @Get('42')
    // login(@Request() req: any): any {
    //     console.log(req.user)
    //     return req.user
    // }
  
    // @Get('42')l
    // login() {
    //     console.log('authenticate_')
    //     const handler = passport.authenticate('42');
    //     handler();
    // }


    @Post('signup')
    signup(@Body() dto: AuthDto) {
        console.log("SIGNUP:____")
    }

    // @Post('signin')
    // signin(@Body() dto: AuthDto) {
    //     return this.authService.signin(dto);
    // }
}