import { Injectable, OnModuleInit } from '@nestjs/common';
import * as qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { MessageTooLongError } from './errors/message-too-long.error';
import { InvalidChatidFormatError } from './errors/invalid-chatid-format.error';
import { Message } from './entities/whatsapp.entity';
import { Message as WhatsappMessage } from 'whatsapp-web.js';
import { Mutex } from 'async-mutex';
import { isEmoji } from '../utils/is-emoji.util';
import { InvalidReactionError } from './errors/invalid-reaction.error';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private static chatIdRegex = /^\d+@[cg].us$/;

  private static messageListenerMutex = new Mutex();

  private static chatListenerMutex = new Mutex();

  private client: Client;

  private messageListeners: Record<number, (message: Message) => void>;

  private chatListeners: Record<
    string,
    Record<number, (message: Message) => void>
  >;

  constructor() {
    this.client = WhatsappService.createClient();
    this.messageListeners = {};
    this.chatListeners = {};
    this.registerClientEvents();
  }

  async onModuleInit() {
    await this.initializeClient();
  }

  private async initializeClient() {
    await this.client.initialize();
  }

  private registerClientEvents() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('disconnected', this.reconnect.bind(this));
    this.client.on('message_create', this.onNewMessage.bind(this));
  }

  private static createClient() {
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: '/tmp/whatsapp',
      }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  private async reconnect() {
    await this.client.destroy().catch(() => {});
    this.client = WhatsappService.createClient();
    this.registerClientEvents();
    await this.initializeClient();
  }

  async addMessageListener(
    listener: (message: Message) => void,
  ): Promise<number> {
    return await WhatsappService.messageListenerMutex.runExclusive(async () => {
      const listenerId = WhatsappService.getListenerId(this.messageListeners);
      this.messageListeners[listenerId] = listener;

      return listenerId;
    });
  }

  async removeMessageListener(listenerId: number) {
    return await WhatsappService.messageListenerMutex.runExclusive(async () => {
      delete this.messageListeners[listenerId];
    });
  }

  private static validateChatIdFormat(chatId: string) {
    if (!WhatsappService.chatIdRegex.test(chatId)) {
      throw new InvalidChatidFormatError(chatId);
    }
  }

  private addChatListenerPreflight(chatId: string) {
    WhatsappService.validateChatIdFormat(chatId);

    if (!this.chatListeners[chatId]) {
      this.chatListeners[chatId] = {};
    }
  }

  async addChatListener(chatId: string, listener: (message: Message) => void) {
    return await WhatsappService.chatListenerMutex.runExclusive(async () => {
      this.addChatListenerPreflight(chatId);

      const listenerId = WhatsappService.getListenerId(
        this.chatListeners[chatId],
      );
      this.chatListeners[chatId][listenerId] = listener;

      return `${chatId}:${listenerId}`;
    });
  }

  async removeChatListener(listenerId: string) {
    const [chatId, listenerIdNumber] = listenerId.split(':');

    return await WhatsappService.chatListenerMutex.runExclusive(async () => {
      delete this.chatListeners[chatId][listenerIdNumber];
    });
  }

  private sendMessagePreflight(to: string, message: string) {
    if (message.length > 4096) {
      throw new MessageTooLongError(message.length);
    }

    WhatsappService.validateChatIdFormat(to);
  }

  async sendMessage(to: string, message: string) {
    this.sendMessagePreflight(to, message);

    return await this.client
      .sendMessage(to, message)
      .then((sent) => sent.id._serialized);
  }

  private async onNewMessage(message: WhatsappMessage) {
    const chatId = message.fromMe ? message.to : message.from;

    Object.values(this.messageListeners).forEach((listener) =>
      listener(Message.fromWhatsappMessage(message)),
    );
    if (this.chatListeners[chatId]) {
      Object.values(this.chatListeners[chatId]).forEach((listener) =>
        listener(Message.fromWhatsappMessage(message)),
      );
    }
  }

  async reactToMessage(messageId: string, reaction: string) {
    if (!isEmoji(reaction)) {
      throw new InvalidReactionError(reaction);
    }

    await this.client
      .getMessageById(messageId)
      .then((message) => message.react(reaction));
  }

  async unreactToMessage(messageId: string) {
    await this.client
      .getMessageById(messageId)
      .then((message) => message.react(''));
  }

  private static getListenerId(listeners: Record<number, any>) {
    const id = Array.from({
      length: Object.keys(listeners).length,
    }).findIndex((_, i) => !listeners[i]);

    if (id === -1) {
      return Object.keys(listeners).length;
    }

    return id;
  }
}
