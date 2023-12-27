import { Chat as WhatsappChat } from 'whatsapp-web.js';

export class Chat {
  id: string;
  isArchived: boolean;
  isGroup: boolean;
  isMuted: boolean;
  isReadOnly: boolean;
  name: string;
  muteExpiration: number;
  lastUpdateTimestamp: number;
  unreadCount: number;

  constructor(data: Chat) {
    Object.assign(this, data);
  }

  static fromWhatsappChat(chat: WhatsappChat) {
    return new Chat({
      id: chat.id._serialized,
      isArchived: chat.archived,
      isGroup: chat.isGroup,
      isMuted: chat.isMuted,
      isReadOnly: chat.isReadOnly,
      name: chat.name,
      muteExpiration: chat.muteExpiration,
      lastUpdateTimestamp: chat.timestamp,
      unreadCount: chat.unreadCount,
    });
  }
}
