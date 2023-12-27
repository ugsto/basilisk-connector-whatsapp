import { TextMessage } from '../entities/text-message.entity';

export type TextMessageHandler = (message: TextMessage) => void;
