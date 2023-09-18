import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import {passport} from 'passport';
// import passport = require("passport");
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: "http://localhost:8080",
    credentials: true
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  
  app.use(passport.initialize())
  await app.listen(3000);
}
bootstrap();
