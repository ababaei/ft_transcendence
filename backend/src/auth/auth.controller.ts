import { Body, Controller, Get, Header, Headers, Next, Param, Post, Redirect, Req, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import * as passport from 'passport';
import { SchoolAuthGuard } from './guards/42auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { SessionSerializer } from './utils/serializer';
import { PrismaService } from 'src/prisma/prisma.service';
// import { SchoolStrategy } from './strategy/school.strategy';



@Controller('auth')
export class AuthController {
    constructor (
        private authService: AuthService,
        private serializeService: SessionSerializer,
        private prismaService: PrismaService
    ) {}

    @Get('test')
    test(@Req() req: Request, @Res() res: Response) {
        console.log('b_cookies: ', req.cookies.userData.token);
        res.cookie('userData', req.cookies.userData.token, {httpOnly: true, secure: false})
    }

    @Get('user/:login')
    @UseGuards(AuthGuard('42'))
    async getUser(@Param() params: {login: string}) {
        console.log("LOGIN: ", params.login)
        
        const user =  await this.prismaService.user.findFirst(
            {where: {name: params.login}}
        )
        return user;
    }

    @Get('42')
    @UseGuards(AuthGuard('42'))
    async login() {
        console.log("entry")
        passport.authenticate('42')
    }

    @Get('42/callback')
    @UseGuards(AuthGuard('42'))
    async callback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        console.log("______________________callback__________________")
        passport.authenticate('42', { failureRedirect: '/fail' })
        console.log("USER: ", req.user)
        res.cookie('userData', JSON.stringify(req.user), {secure: false})
        return res
        .status(302)
        .redirect('http://localhost:8080/login')
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