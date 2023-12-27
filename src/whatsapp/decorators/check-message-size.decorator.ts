import { MessageTooLongError } from '../errors/message-too-long.error';

export function checkMessageSize<F extends string>(
  field: F,
  maxMessageSize: number,
) {
  return (_target: any, _propertyKey: any, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function <Dto extends Record<F, string>>(data: Dto) {
      const message = data[field];
      const messageSize = Buffer.byteLength(message, 'utf8');

      if (messageSize > maxMessageSize) {
        throw new MessageTooLongError(messageSize, maxMessageSize);
      }

      return originalMethod.apply(this, [data]);
    };
  };
}
