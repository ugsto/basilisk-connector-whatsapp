const EMOJI_REGEX =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\p{Emoji_Modifier_Base}\p{Emoji_Modifier})?(\u200D(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(\p{Emoji_Modifier_Base}\p{Emoji_Modifier})?)*$/u;

export function isEmoji(emoji: string) {
  return EMOJI_REGEX.test(emoji);
}
