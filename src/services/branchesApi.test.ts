import { describe, expect, it } from 'vitest';
import { STORE_PANELS } from '../data/stores.data';
import { fetchBranches, mergeBranches, parseBranches, toStoreHours } from './branchesApi';

const feed = {
  branches: [
    {
      name: 'New York Filial Bento',
      address: 'R. Gen. Bento Martins, 100',
      phone: '+55 55 3412-0000',
      opening_hours: { mon: '09:00-18:00', sat: '09:00-12:00', sun: null },
      timezone: 'America/Sao_Paulo',
    },
  ],
};

const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

describe('branches API', () => {
  it('maps weekday names to 0-6 and skips closed or malformed days', () => {
    const hours = toStoreHours({ mon: '09:00-18:00', sun: null, tue: '9-18', xyz: '09:00-10:00' });
    expect(hours).toEqual({ 1: ['09:00', '18:00'] });
    expect(toStoreHours(null)).toBeUndefined();
  });

  it('parses the feed and rejects a malformed one', () => {
    expect(parseBranches(feed)?.[0].phone).toBe('+55 55 3412-0000');
    expect(parseBranches({ branches: [{ phone: 'x' }] })).toBeNull();
    expect(parseBranches({})).toBeNull();
  });

  it('overlays live contact data by name and strips placeholders from unmatched panels', () => {
    const merged = mergeBranches(STORE_PANELS, parseBranches(feed)!);
    const bento = merged.find((p) => p.id === 'store-bento')!;
    expect(bento.phone).toBe('+55 55 3412-0000');
    expect(bento.noteLocation).toBe('R. Gen. Bento Martins, 100');
    expect(bento.hours?.[1]).toEqual(['09:00', '18:00']);
    expect(bento.name).toBe('New York Filial Bento');
    const duque = merged.find((p) => p.id === 'store-duque')!;
    expect(duque.phone).toBeUndefined();
    expect(duque.hours).toBeUndefined();
  });

  it('keeps the static data when the API lists nothing', () => {
    expect(mergeBranches(STORE_PANELS, [])).toBe(STORE_PANELS);
  });

  it('fetches /public/v1/branches and degrades to null on failure', async () => {
    let url = '';
    const ok = (async (input: RequestInfo | URL) => {
      url = String(input);
      return response(feed);
    }) as typeof fetch;
    expect(await fetchBranches('http://api.test/', { fetchImpl: ok })).toHaveLength(1);
    expect(url).toBe('http://api.test/public/v1/branches');

    const notOk = (async () => response({}, false)) as typeof fetch;
    expect(await fetchBranches('http://api.test', { fetchImpl: notOk })).toBeNull();
    expect(await fetchBranches('', { fetchImpl: ok })).toBeNull();

    const boom = (async () => {
      throw new Error('net');
    }) as typeof fetch;
    expect(await fetchBranches('http://api.test', { fetchImpl: boom })).toBeNull();
  });
});
