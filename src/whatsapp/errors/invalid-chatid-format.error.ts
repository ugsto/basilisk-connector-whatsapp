import { WhatsappError } from './whatsapp.error';

export class InvalidChatidFormatError extends WhatsappError {
  constructor(chatId: string) {
    super(`Invalid chatId format: ${chatId}. Expected format: 0000000000@c.us`);
  }
}
