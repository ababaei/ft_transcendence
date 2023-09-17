import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import axios from 'axios';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @Get('42/login')
    login() {
        axios.get('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-60542ab6ac5344055e27304f8ab29ff02531f0fc5e81707ed6d6daf07dcf0a54&redirect_uri=http%3A%2F%2Flocalhost%3A8080&response_type=code')
        return 'LOG WITH 42'
    }

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return this.authService.signup(dto);
    }

    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto);
    }
}