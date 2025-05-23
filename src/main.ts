/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ✅ Import ValidationPipe
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

  // ✅ Apply global validation pipe with transform enabled
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,         // 🔁 Enable transformation (e.g., lowercase → UPPERCASE)
      whitelist: true,         // ✅ Strip out any unexpected fields
      forbidNonWhitelisted: true, // Optional: throw error on unexpected fields
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
