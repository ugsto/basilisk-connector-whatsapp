import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ClientsModule } from '@nestjs/microservices';
import { grpcClientOptions } from '../grpc-client.options';

@Module({
  imports: [
    ClientsModule.register([
      { name: 'WHATSAPP_PACKAGE', ...grpcClientOptions },
    ]),
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
