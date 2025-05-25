import { randomUUID } from 'crypto';

if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID
  } as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Bookit APIs')
    .setDescription('')
    .setVersion('1.0')
    .addServer('/v1')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
