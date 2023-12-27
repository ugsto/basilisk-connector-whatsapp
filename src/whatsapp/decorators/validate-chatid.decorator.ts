import { InvalidChatidFormatError } from '../errors/invalid-chatid-format.error';

const VALIDATOR_REGEX = /^\d+@[cg]\.us$/;

export function validateChatId<F extends string>(field: F) {
  return (_target: any, _propertyKey: any, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function <Dto extends Record<F, string>>(data: Dto) {
      const chatId = data[field];

      if (!VALIDATOR_REGEX.test(chatId)) {
        throw new InvalidChatidFormatError(chatId);
      }

      return originalMethod.apply(this, [data]);
    };
  };
}
