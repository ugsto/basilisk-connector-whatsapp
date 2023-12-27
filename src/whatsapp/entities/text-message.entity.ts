import { Message } from 'whatsapp-web.js';

export class TextMessage {
  metadata: {
    id: string;
    isFromMe: boolean;
    forwardingScore: number;
    isStarref: boolean;
    isStatus: boolean;
    timestamp: number;
    chatId: string;
    authorId: string;
    toId: string;
  };
  content: {
    body: string;
    links: Array<{
      link: string;
      isSuspicious: boolean;
    }>;
    mentionedIds: string[];
  };

  constructor(data: TextMessage) {
    Object.assign(this, data);
  }

  static fromWhatsappMessage(message: Message) {
    const chatId = message.fromMe ? message.to : message.from;
    const isGroup = chatId.endsWith('@g.us');
    const authorId = isGroup
      ? message.author
      : message.fromMe
        ? 'self'
        : chatId;

    return new TextMessage({
      metadata: {
        id: message.id._serialized,
        isFromMe: message.fromMe,
        forwardingScore: message.forwardingScore,
        isStarref: message.isStarred,
        isStatus: message.isStatus,
        timestamp: message.timestamp,
        chatId,
        authorId,
        toId: message.to,
      },
      content: {
        body: message.body,
        links: message.links,
        mentionedIds: message.mentionedIds,
      },
    });
  }
}
