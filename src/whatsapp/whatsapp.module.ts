import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClientOptions } from '../grpc-client.options';
import { WhatsappProvider } from './whatsapp.provider';

@Module({
  imports: [
    ClientsModule.register([
      { name: 'WHATSAPP_PACKAGE', ...grpcClientOptions },
    ]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappProvider],
})
export class WhatsappModule {}
