// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { getConsent, setConsent } from './consent';

describe('consent', () => {
  beforeEach(() => window.localStorage.clear());

  it('is unset until the visitor chooses, then remembers the choice', () => {
    expect(getConsent()).toBeNull();
    setConsent('granted');
    expect(getConsent()).toBe('granted');
    setConsent('denied');
    expect(getConsent()).toBe('denied');
    setConsent(null);
    expect(getConsent()).toBeNull();
  });

  it('ignores garbage and survives blocked storage', () => {
    window.localStorage.setItem('ny:consent', 'yes');
    expect(getConsent()).toBeNull();
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(getConsent(blocked)).toBeNull();
  });
});
