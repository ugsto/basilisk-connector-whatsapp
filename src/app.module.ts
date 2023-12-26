import { Module } from '@nestjs/common';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
})
export class AppModule {}
