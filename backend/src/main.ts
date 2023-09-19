import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import {passport} from 'passport';
// import passport = require("passport");
import * as passport from 'passport';
import * as session from 'express-session'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: "http://localhost:8080",
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  
  app.use(session({
    secret: 'thesecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000}
  }));

  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(3000);
}
bootstrap();
