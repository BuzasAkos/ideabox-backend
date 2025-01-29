import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that are not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-DTO properties are provided
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );
  await app.listen(3000);
}
bootstrap();
