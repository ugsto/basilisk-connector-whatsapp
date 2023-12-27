import { TextMessageHandlerManager } from './text-message-handler-manager.entity';

describe('TextMessageHandlerManager', () => {
  let messageHandlerManager: TextMessageHandlerManager;

  beforeEach(() => {
    messageHandlerManager = new TextMessageHandlerManager();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should add a handler', async () => {
    const handler = jest.fn();

    const handlerId = await messageHandlerManager.addHandler(handler);

    expect(messageHandlerManager.getHandler(handlerId)).toBe(handler);
    expect(messageHandlerManager.getSize()).toBe(1);
  });

  it('should remove a handler', async () => {
    const handler = jest.fn();

    const handlerId = await messageHandlerManager.addHandler(handler);
    await messageHandlerManager.removeHandler(handlerId);

    expect(messageHandlerManager.getHandler(handlerId)).toBeUndefined();
    expect(messageHandlerManager.getSize()).toBe(0);
  });

  it('should get the size of handlers', async () => {
    expect(messageHandlerManager.getSize()).toBe(0);

    await messageHandlerManager.addHandler(jest.fn());
    await messageHandlerManager.addHandler(jest.fn());

    expect(messageHandlerManager.getSize()).toBe(2);
  });

  it('should get a handler by ID', async () => {
    const handler = jest.fn();

    const handlerId = await messageHandlerManager.addHandler(handler);

    expect(messageHandlerManager.getHandler(handlerId)).toBe(handler);
  });

  it('should not mess with other handler IDs when removing a handler in the middle', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();

    const handler1Id = await messageHandlerManager.addHandler(handler1);
    const handler2Id = await messageHandlerManager.addHandler(handler2);
    const handler3Id = await messageHandlerManager.addHandler(handler3);

    await messageHandlerManager.removeHandler(handler2Id);

    expect(messageHandlerManager.getHandler(handler2Id)).toBeUndefined();

    expect(messageHandlerManager.getHandler(handler1Id)).toBe(handler1);
    expect(messageHandlerManager.getHandler(handler3Id)).toBe(handler3);
  });

  it('should return all handlers', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    await messageHandlerManager.addHandler(handler1);
    await messageHandlerManager.addHandler(handler2);

    expect(messageHandlerManager.getHandlers()).toEqual([handler1, handler2]);
  });
});
