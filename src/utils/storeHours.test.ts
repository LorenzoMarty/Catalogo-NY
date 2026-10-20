import { describe, expect, it } from 'vitest';
import { isOpenNow } from './storeHours';

const TZ = 'America/Sao_Paulo'; // UTC-3
const hours = { 1: ['09:00', '18:00'], 6: ['09:00', '12:00'] } as const;

describe('isOpenNow', () => {
  it('is null without hours', () => {
    expect(isOpenNow(undefined, TZ)).toBeNull();
  });
  it('uses the store timezone, not the host one', () => {
    // Mon 2026-01-05 11:00 BRT = 14:00Z
    expect(isOpenNow(hours, TZ, new Date('2026-01-05T14:00:00Z'))).toBe(true);
    // Mon 08:00 BRT = 11:00Z
    expect(isOpenNow(hours, TZ, new Date('2026-01-05T11:00:00Z'))).toBe(false);
  });
  it('close time is exclusive and missing days are closed', () => {
    expect(isOpenNow(hours, TZ, new Date('2026-01-05T21:00:00Z'))).toBe(false); // 18:00
    expect(isOpenNow(hours, TZ, new Date('2026-01-06T15:00:00Z'))).toBe(false); // Tue
    expect(isOpenNow(hours, TZ, new Date('2026-01-10T13:00:00Z'))).toBe(true); // Sat 10:00
  });
  it('handles UTC date differing from local date', () => {
    // Tue 01:00Z is still Mon 22:00 BRT -> closed, but Mon
    expect(isOpenNow(hours, TZ, new Date('2026-01-06T01:00:00Z'))).toBe(false);
  });
});
