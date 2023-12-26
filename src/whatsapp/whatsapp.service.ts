import { Injectable, OnModuleInit } from '@nestjs/common';
import * as qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { MessageTooLongError } from './errors/message-too-long.error';
import { InvalidChatidFormatError } from './errors/invalid-chatid-format.error';
import { Message } from './entities/whatsapp.entity';
import { Message as WhatsappMessage } from 'whatsapp-web.js';
import { Mutex } from 'async-mutex';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private static chatIdRegex = /^\d+@c.us$/;

  private static createClient() {
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp',
      }),
    });
  }

  private static messageListenerMutex = new Mutex();

  private client: Client;

  private messageListeners: Record<
    string,
    Record<number, (message: Message) => void>
  >;

  constructor() {
    this.client = WhatsappService.createClient();
    this.messageListeners = {};
    this.registerClientEvents();
  }

  async onModuleInit() {
    await this.initializeClient();
  }

  private addMessageListenerPreflight(chatId: string) {
    if (!WhatsappService.chatIdRegex.test(chatId)) {
      throw new InvalidChatidFormatError(chatId);
    }

    if (!this.messageListeners[chatId]) {
      this.messageListeners[chatId] = {};
    }
  }

  async addMessageListener(
    chatId: string,
    listener: (message: Message) => void,
  ) {
    return await WhatsappService.messageListenerMutex.runExclusive(async () => {
      this.addMessageListenerPreflight(chatId);

      const listenerId = this.getMessageListenerId(chatId);
      this.messageListeners[chatId][listenerId] = listener;

      return `${chatId}:${listenerId}`;
    });
  }

  async removeMessageListener(listenerId: string) {
    const [chatId, listenerIdNumber] = listenerId.split(':');

    return await WhatsappService.messageListenerMutex.runExclusive(async () => {
      delete this.messageListeners[chatId][listenerIdNumber];
    });
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

  private getMessageListenerId(chatId: string) {
    const id = Array.from({
      length: Object.keys(this.messageListeners[chatId]).length,
    }).findIndex((_, i) => !this.messageListeners[chatId][i]);

    if (id === -1) {
      return Object.keys(this.messageListeners[chatId]).length;
    }

    return id;
  }

  private registerClientEvents() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('disconnected', this.reconnect.bind(this));
    this.client.on('message_create', this.onNewMessage.bind(this));
  }

  private async onNewMessage(message: WhatsappMessage) {
    const chatId = message.fromMe ? message.to : message.from;

    if (this.messageListeners[chatId]) {
      Object.values(this.messageListeners[chatId]).forEach((listener) =>
        listener(Message.fromWhatsappMessage(message)),
      );
    }
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
