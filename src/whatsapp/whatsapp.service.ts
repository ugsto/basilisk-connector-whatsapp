import { Client, Message, MessageTypes } from 'whatsapp-web.js';
import { TextMessage } from './entities/text-message.entity';
import { TextMessageHandlerManager } from './entities/text-message-handler-manager.entity';
import { TextMessageHandler } from './types/text-message-handler.type';
import { Chat } from './entities/chat.entity';
import { checkMessageSize } from './decorators/check-message-size.decorator';
import { validateChatId } from './decorators/validate-chatid.decorator';
import { validateEmoji } from './decorators/validate-emoji.decorator';

export class WhatsappService {
  private globalMessageHandlerManager: TextMessageHandlerManager;
  private chatMessageHandlerManager: Map<string, TextMessageHandlerManager>;
  private authorMessageHandlerManager: Map<string, TextMessageHandlerManager>;

  constructor(private readonly client: Client) {
    this.globalMessageHandlerManager = new TextMessageHandlerManager();
    this.chatMessageHandlerManager = new Map();
    this.authorMessageHandlerManager = new Map();

    this.setupMessageListener();
  }

  @checkMessageSize('message', 4096)
  @validateChatId('chatId')
  async sendMessage({ chatId, message }: { chatId: string; message: string }) {
    const sentMessage = await this.client.sendMessage(chatId, message);

    return sentMessage.id._serialized;
  }

  async addGlobalMessageHandler(handler: TextMessageHandler) {
    return this.globalMessageHandlerManager.addHandler(handler);
  }

  async removeGlobalMessageHandler(id: number) {
    this.globalMessageHandlerManager.removeHandler(id);
  }

  @validateChatId('chatId')
  async addChatMessageHandler({
    chatId,
    handler,
  }: {
    chatId: string;
    handler: TextMessageHandler;
  }) {
    if (!this.chatMessageHandlerManager.has(chatId)) {
      this.chatMessageHandlerManager.set(
        chatId,
        new TextMessageHandlerManager(),
      );
    }

    return this.chatMessageHandlerManager.get(chatId)?.addHandler(handler);
  }

  @validateChatId('chatId')
  async removeChatMessageHandler({
    chatId,
    id,
  }: {
    chatId: string;
    id: number;
  }) {
    this.chatMessageHandlerManager.get(chatId)?.removeHandler(id);
  }

  @validateChatId('authorId')
  async addAuthorMessageHandler({
    authorId,
    handler,
  }: {
    authorId: string;
    handler: TextMessageHandler;
  }) {
    if (!this.authorMessageHandlerManager.has(authorId)) {
      this.authorMessageHandlerManager.set(
        authorId,
        new TextMessageHandlerManager(),
      );
    }

    return this.authorMessageHandlerManager.get(authorId)?.addHandler(handler);
  }

  @validateChatId('authorId')
  async removeAuthorMessageHandler({
    authorId,
    id,
  }: {
    authorId: string;
    id: number;
  }) {
    this.authorMessageHandlerManager.get(authorId)?.removeHandler(id);
  }

  async getChats() {
    const chats = await this.client
      .getChats()
      .then((chat) => chat.map(Chat.fromWhatsappChat));

    return { chats };
  }

  @validateEmoji('emoji')
  async reactToMessage({
    messageId,
    emoji,
  }: {
    messageId: string;
    emoji: string;
  }) {
    await this.client.getMessageById(messageId).then((message) => {
      message.react(emoji);
    });
  }

  async removeReactionToMessage({ messageId }: { messageId: string }) {
    await this.client.getMessageById(messageId).then((message) => {
      message.react('');
    });
  }

  private setupMessageListener() {
    this.client.on('message_create', (message) => {
      this.onNewMessage(message);
    });
  }

  private onNewMessage(message: Message) {
    switch (message.type) {
      case MessageTypes.TEXT: {
        this.onNewTextMessage(TextMessage.fromWhatsappMessage(message));
        break;
      }
      default: {
        break;
      }
    }
  }

  private onNewTextMessage(message: TextMessage) {
    this.globalMessageHandlerManager
      .getHandlers()
      .forEach((handler) => handler(message));

    this.chatMessageHandlerManager
      .get(message.metadata.chatId)
      ?.getHandlers()
      .forEach((handler) => handler(message));

    this.authorMessageHandlerManager
      .get(message.metadata.authorId)
      ?.getHandlers()
      .forEach((handler) => handler(message));
  }
}
