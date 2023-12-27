import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WhatsappProvider } from './whatsapp.provider';
import { WhatsappService } from './whatsapp.service';
import { Subject, finalize } from 'rxjs';

@Controller()
export class WhatsappController {
  private whatsappServicePromise: Promise<WhatsappService>;

  constructor(private readonly whatsappProvider: WhatsappProvider) {
    this.whatsappServicePromise = this.whatsappProvider.getWhatsappService();
  }

  private async whatsappService() {
    return await this.whatsappServicePromise;
  }

  @GrpcMethod('WhatsApp', 'SendMessage')
  async sendMessage({ chatId, body }: { chatId: string; body: string }) {
    const service = await this.whatsappService();

    const sentMessageId = await service.sendMessage({ chatId, message: body });

    return {
      id: sentMessageId,
    };
  }

  @GrpcMethod('WhatsApp', 'SubscribeToTextMessages')
  async subscribeToTextMessages() {
    const subject = new Subject();
    const service = await this.whatsappService();

    const handlerId = await service.addGlobalMessageHandler((message) => {
      subject.next(message);
    });

    return subject.asObservable().pipe(
      finalize(() => {
        service.removeGlobalMessageHandler(handlerId);
      }),
    );
  }

  @GrpcMethod('WhatsApp', 'SubscribeToChatTextMessages')
  async subscribeToChatTextMessages({ chatId }: { chatId: string }) {
    const subject = new Subject();
    const service = await this.whatsappService();

    const handlerId = await service.addChatMessageHandler({
      chatId,
      handler(message) {
        subject.next(message);
      },
    });

    return subject.asObservable().pipe(
      finalize(() => {
        service.removeChatMessageHandler({ chatId, id: handlerId });
      }),
    );
  }

  @GrpcMethod('WhatsApp', 'SubscribeToAuthorTextMessages')
  async subscribeToAuthorTextMessages({ authorId }: { authorId: string }) {
    const subject = new Subject();
    const service = await this.whatsappService();

    const handlerId = await service.addAuthorMessageHandler({
      authorId,
      handler(message) {
        subject.next(message);
      },
    });

    return subject.asObservable().pipe(
      finalize(() => {
        service.removeAuthorMessageHandler({ authorId, id: handlerId });
      }),
    );
  }

  @GrpcMethod('WhatsApp', 'GetChats')
  async getChats() {
    const service = await this.whatsappService();

    return await service.getChats();
  }

  @GrpcMethod('WhatsApp', 'React')
  async reactToMessage({
    messageId,
    emoji,
  }: {
    messageId: string;
    emoji: string;
  }) {
    const service = await this.whatsappService();

    await service.reactToMessage({ messageId, emoji });
  }

  @GrpcMethod('WhatsApp', 'RemoveReaction')
  async removeReactionToMessage({ messageId }: { messageId: string }) {
    const service = await this.whatsappService();

    await service.removeReactionToMessage({ messageId });
  }
}
