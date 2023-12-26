import { Message } from 'whatsapp-web.js';

export function GetWhatsappMessageChatId(message: Message) {
  return message.fromMe ? message.to : message.from;
}
