import { Body, Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { SchoolAuthGuard } from './auth/guards/42auth.guard';
import { JwtGuard } from './auth/guards/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('ping')
  @UseGuards(JwtGuard)
  async pingFromClient(
    @Req() req: Request) {
    try {
      console.log('ping from: ', req)
    } catch {
      // console.log('error: create channel');
      return 'backend: error ping';
    }
  }
}
