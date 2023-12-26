import { WhatsappError } from './whatsapp.error';

export class MessageTooLongError extends WhatsappError {
  constructor(messageLength: number) {
    super(`Message too long: ${messageLength} > 4096`);
  }
}
