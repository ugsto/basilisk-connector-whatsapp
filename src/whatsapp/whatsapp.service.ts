import { Injectable, OnModuleInit } from '@nestjs/common';
import * as qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { MessageTooLongError } from './errors/message-too-long.error';
import { InvalidChatidFormatError } from './errors/invalid-chatid-format.error';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;

  private static chatIdRegex = /^\d+@c.us$/;

  private static createClient() {
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp',
      }),
    });
  }

  constructor() {
    this.client = WhatsappService.createClient();

    this.registerClientEvents();
  }

  async onModuleInit() {
    await this.initializeClient();
  }

  private sendMessagePreflight(to: string, message: string) {
    if (message.length > 4096) {
      throw new MessageTooLongError(message.length);
    }

    if (!WhatsappService.chatIdRegex.test(to)) {
      throw new InvalidChatidFormatError(to);
    }
  }

  async sendMessage(to: string, message: string) {
    this.sendMessagePreflight(to, message);

    return await this.client
      .sendMessage(to, message)
      .then((sent) => sent.id._serialized);
  }

  private registerClientEvents() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('disconnected', this.reconnect.bind(this));
  }

  private async initializeClient() {
    await this.client.initialize();
  }

  private async reconnect() {
    await this.client.destroy().catch(() => {});
    this.client = WhatsappService.createClient();
    this.registerClientEvents();
    await this.initializeClient();
  }
}
