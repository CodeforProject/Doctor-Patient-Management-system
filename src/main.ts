// // import { NestFactory } from '@nestjs/core';
// // import { AppModule } from './app.module';
// // import { ValidationPipe } from '@nestjs/common';

// // async function bootstrap() {
// //   const app = await NestFactory.create(AppModule);

// //   app.enableCors();

// //   app.useGlobalPipes(
// //     new ValidationPipe({
// //       whitelist: true,
// //       forbidNonWhitelisted: true,
// //       transform: true,
// //     }),
// //   );

// //   app.setGlobalPrefix('api');

// //   await app.listen(3000);
// // }
// // bootstrap();
// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.setGlobalPrefix('api')
//   await app.listen(3000);
// }
// bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000/api');
}
bootstrap();

