import { Controller } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { GrpcMethod } from '@nestjs/microservices';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @GrpcMethod('WhatsAppService', 'SendMessage')
  async sendMessage(data: SendMessageDto) {
    const { chatId, content } = data;

    const sentMessageId = await this.whatsappService.sendMessage(
      chatId,
      content,
    );

    return {
      id: sentMessageId,
    };
  }
}
