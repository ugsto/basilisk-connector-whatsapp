import { Message as WhatsappMessage } from 'whatsapp-web.js';

export class Message {
  id: string;
  body: string;
  chatId: string;
  from: string;
  to: string;
  timestamp: number;

  constructor(data: Message) {
    Object.assign(this, data);
  }

  static fromWhatsappMessage(whatsappMessage: WhatsappMessage): Message {
    return new Message({
      id: whatsappMessage.id._serialized,
      body: whatsappMessage.body,
      chatId: whatsappMessage.from,
      from: whatsappMessage.author,
      to: whatsappMessage.to,
      timestamp: whatsappMessage.timestamp,
    });
  }
}
