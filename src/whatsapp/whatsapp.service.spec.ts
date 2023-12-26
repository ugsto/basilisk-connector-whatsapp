import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service';
import { MessageTooLongError } from './errors/message-too-long.error';
import { InvalidChatidFormatError } from './errors/invalid-chatid-format.error';

describe('WhatsappService', () => {
  let whatsappService: WhatsappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappService],
    }).compile();

    whatsappService = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(whatsappService).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message using the client', async () => {
      const clientSpy = jest
        .spyOn(whatsappService['client'], 'sendMessage')
        .mockReturnValue(
          new Promise((resolve) =>
            resolve({
              id: {
                _serialized: '12345@c.us',
              },
            } as any),
          ),
        );
      const to = '12345@c.us';
      const message = 'Hello, world!';

      await whatsappService.sendMessage(to, message);

      expect(clientSpy).toHaveBeenCalledWith(to, message);
    });

    it('should throw MessageTooLongError if the message is too long', async () => {
      const to = '12345@c.us';
      const longMessage = 'a'.repeat(5000);

      await expect(
        whatsappService.sendMessage(to, longMessage),
      ).rejects.toThrow(MessageTooLongError);
    });

    it('should throw InvalidChatidFormatError if the chatId format is invalid', async () => {
      const invalidChatId = 'invalid';

      await expect(
        whatsappService.sendMessage(invalidChatId, 'Hello'),
      ).rejects.toThrow(InvalidChatidFormatError);
    });
  });

  describe('addMessageListener', () => {
    it('should add a message listener', async () => {
      const listener = jest.fn();
      const chatId = '12345@c.us';

      const listenerId = await whatsappService.addMessageListener(
        chatId,
        listener,
      );
      const [, listenerIdNumber] = listenerId.split(':');

      expect(listenerId).toBeDefined();
      expect(whatsappService['messageListeners'][chatId]).toHaveProperty(
        listenerIdNumber,
      );
    });

    it('should throw InvalidChatidFormatError if the chatId format is invalid', async () => {
      const invalidChatId = 'invalid';
      const listener = jest.fn();

      await expect(
        whatsappService.addMessageListener(invalidChatId, listener),
      ).rejects.toThrow(InvalidChatidFormatError);
    });
  });

  describe('removeMessageListener', () => {
    it('should remove a message listener', async () => {
      const listener = jest.fn();
      const chatId = '12345@c.us';

      const listenerId = await whatsappService.addMessageListener(
        chatId,
        listener,
      );
      const [, listenerIdNumber] = listenerId.split(':');
      expect(whatsappService['messageListeners'][chatId]).toHaveProperty(
        listenerIdNumber,
      );

      await whatsappService.removeMessageListener(listenerId);
      expect(whatsappService['messageListeners'][chatId]).not.toHaveProperty(
        listenerIdNumber,
      );
    });
  });
});
