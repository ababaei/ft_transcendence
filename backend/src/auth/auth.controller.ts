import { Body, Controller, Get, Header, Headers, Next, Post, Redirect, Req, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as passport from 'passport';
import { SchoolAuthGuard } from './guards/42auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
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
    callback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        console.log("______________________callback__________________")
        passport.authenticate('42', { failureRedirect: '/fail' })
        console.log(req.user)
        // res.cookie('userData', JSON.stringify(req.user), {httpOnly: true})
        res.status(302).redirect('http://localhost:8080/')
        return;
    }

    @Get('logout')
    logout(@Req() req: any, @Res() res: any) {
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