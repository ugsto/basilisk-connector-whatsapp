import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { grpcClientOptions } from './grpc-client.options';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    grpcClientOptions,
  );

  await app.listen();

  console.log(`Listening on ${grpcClientOptions.options.url}`);
}

bootstrap();
