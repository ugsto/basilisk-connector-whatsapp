import { Mutex } from 'async-mutex';
import { TextMessageHandler } from '../types/text-message-handler.type';

export class TextMessageHandlerManager {
  private static mutex: Mutex = new Mutex();

  private handlers: Map<number, TextMessageHandler> = new Map();

  async addHandler(handler: TextMessageHandler) {
    return await TextMessageHandlerManager.mutex.runExclusive(async () => {
      const handlerId = this.getHandlerId();
      this.handlers.set(handlerId, handler);

      return handlerId;
    });
  }

  async removeHandler(handlerId: number) {
    await TextMessageHandlerManager.mutex.runExclusive(async () => {
      this.handlers.delete(handlerId);
    });
  }

  getSize() {
    return this.handlers.size;
  }

  getHandler(handlerId: number) {
    return this.handlers.get(handlerId);
  }

  getHandlers() {
    return Array.from(this.handlers.values());
  }

  private getHandlerId() {
    const handlerId = Array.from({ length: this.handlers.size }).findIndex(
      (_, i) => !this.handlers.has(i),
    );

    if (handlerId !== -1) {
      return handlerId;
    }

    return this.handlers.size;
  }
}
