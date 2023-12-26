import { Controller } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { GrpcMethod } from '@nestjs/microservices';
import { SubscribeToChatRequestDto } from './dto/subscribe-to-chat-request.dto';
import { Subject, finalize } from 'rxjs';
import { SendMessageRequestDto } from './dto/send-message-request.dto';
import { Message } from './entities/whatsapp.entity';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @GrpcMethod('WhatsAppService', 'SendMessage')
  async sendMessage(data: SendMessageRequestDto) {
    const { chatId, content } = data;

    const sentMessageId = await this.whatsappService.sendMessage(
      chatId,
      content,
    );

    return {
      id: sentMessageId,
    };
  }

  @GrpcMethod('WhatsAppService', 'SubscribeToChat')
  async subscribeToChat(data: SubscribeToChatRequestDto) {
    const subject = new Subject();
    const { chatId } = data;

    const onMessage = (message: Message) => {
      try {
        subject.next(message);
      } catch (error) {
        console.error(error);
      }
    };

    const listenerId = await this.whatsappService.addMessageListener(
      chatId,
      onMessage,
    );

    return subject.asObservable().pipe(
      finalize(() => {
        this.whatsappService.removeMessageListener(listenerId);
      }),
    );
  }
}
