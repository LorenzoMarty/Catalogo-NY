import { describe, expect, it } from 'vitest';
import { isLowEndDevice } from './useLenisSmoothScroll';

describe('isLowEndDevice', () => {
  it('flags low memory or few cores', () => {
    expect(isLowEndDevice({ deviceMemory: 2, hardwareConcurrency: 8 })).toBe(true);
    expect(isLowEndDevice({ deviceMemory: 8, hardwareConcurrency: 2 })).toBe(true);
  });

  it('keeps smooth scroll when capable or when the browser reports nothing', () => {
    expect(isLowEndDevice({ deviceMemory: 8, hardwareConcurrency: 8 })).toBe(false);
    expect(isLowEndDevice({ hardwareConcurrency: undefined as unknown as number })).toBe(false);
  });
});
