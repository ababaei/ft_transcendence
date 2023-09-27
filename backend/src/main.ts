import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import {passport} from 'passport';
// import passport = require("passport");
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
// import * as session from 'express-session'
import session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(session({
  //   secret: process.env.COOKIE_KEY,
  //   resave: false,
  //   saveUninitialized: false,
  //   cookie: { 
  //     maxAge: 36000,
  //     secure: false
  //   }
  // }));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  
  app.use(cookieParser())
  app.use(passport.initialize())

  app.enableCors({
    origin: "http://localhost:8080",
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    // allowedHeaders: "Content-Type, Authorization",
  });
  // app.use(passport.session())
  await app.listen(3000);
}
bootstrap();
