import { ExpectedEmojiError } from '../errors/expected-emoji.error';

const VALIDATOR_REGEX =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\p{Emoji_Modifier_Base}\p{Emoji_Modifier})?(\u200D(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\p{Emoji_Modifier_Base}\p{Emoji_Modifier})?)*$/u;

export function validateEmoji<F extends string>(field: F) {
  return (_target: any, _propertyKey: any, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function <Dto extends Record<F, string>>(data: Dto) {
      const emoji = data[field];

      if (!VALIDATOR_REGEX.test(emoji)) {
        throw new ExpectedEmojiError(emoji);
      }

      return originalMethod.apply(this, [data]);
    };
  };
}
