import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "http://localhost:8080",
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  const prismaService = app.get(PrismaService);
  await app.listen(3000);
}
bootstrap();