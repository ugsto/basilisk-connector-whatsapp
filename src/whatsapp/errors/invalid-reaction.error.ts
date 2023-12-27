import { WhatsappError } from './whatsapp.error';

export class InvalidReactionError extends WhatsappError {
  constructor(reaction: string) {
    super(`Invalid reaction: ${reaction}. Expected an emoji`);
  }
}
