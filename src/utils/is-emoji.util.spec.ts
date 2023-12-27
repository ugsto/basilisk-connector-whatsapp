import { isEmoji } from './is-emoji.util';

describe('isEmoji function', () => {
  it('should return true for single emojis', () => {
    expect(isEmoji('😊')).toBe(true);
    expect(isEmoji('🚗')).toBe(true);
  });

  it('should return false for non-emoji characters', () => {
    expect(isEmoji('a')).toBe(false);
    expect(isEmoji('1')).toBe(false);
  });

  it('should return false for strings with multiple characters', () => {
    expect(isEmoji('🐶🐱')).toBe(false);
    expect(isEmoji('😊a')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isEmoji('')).toBe(false);
  });

  it('should return true for extended Unicode emojis', () => {
    expect(isEmoji('👨‍👩‍👧')).toBe(true);
  });

  it('should return false for non-pictographic Unicode characters', () => {
    expect(isEmoji('汉')).toBe(false);
    expect(isEmoji('ا')).toBe(false);
  });
});
