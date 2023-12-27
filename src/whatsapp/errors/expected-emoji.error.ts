import { WhatsappError } from './whatsapp.error';

export class ExpectedEmojiError extends WhatsappError {
  constructor(emoji: string) {
    super(`Expected an emoji. Received: ${emoji}`);
  }
}
