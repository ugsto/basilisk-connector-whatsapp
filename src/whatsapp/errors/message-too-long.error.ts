import { WhatsappError } from './whatsapp.error';

export class MessageTooLongError extends WhatsappError {
  constructor(messageLength: number, maxLength: number) {
    super(`Message too long: ${messageLength} > ${maxLength}`);
  }
}
