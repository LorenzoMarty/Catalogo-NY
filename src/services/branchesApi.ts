import { StoreHours, StorePanel } from '../models/store.models';
import { normalizeName } from './catalogApi';

/** One entry of GET /public/v1/branches (Estoque-NY#125). The API sends no id; `name` is the key. */
export interface RemoteBranch {
  readonly name: string;
  readonly address: string | null;
  readonly phone: string | null;
  readonly opening_hours: Readonly<Record<string, string | null>> | null;
  readonly timezone: string | null;
}

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DAY_INDEX: Record<string, DayIndex> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export function parseBranches(value: unknown): readonly RemoteBranch[] | null {
  if (!isRecord(value) || !Array.isArray(value.branches)) return null;
  const branches: RemoteBranch[] = [];
  for (const entry of value.branches) {
    const name = isRecord(entry) ? text(entry.name) : null;
    if (!isRecord(entry) || !name) return null;
    branches.push({
      name,
      address: text(entry.address),
      phone: text(entry.phone),
      opening_hours: isRecord(entry.opening_hours)
        ? (entry.opening_hours as Record<string, string | null>)
        : null,
      timezone: text(entry.timezone),
    });
  }
  return branches;
}

/** `{ mon: '09:00-18:00', sun: null }` -> StoreHours (0 = Sunday). Null or malformed days are closed. */
export function toStoreHours(openingHours: RemoteBranch['opening_hours']): StoreHours | undefined {
  if (!openingHours) return undefined;
  const hours: Partial<Record<DayIndex, readonly [string, string]>> = {};
  for (const [day, span] of Object.entries(openingHours)) {
    const index = DAY_INDEX[day.toLowerCase()];
    const match = index === undefined ? null : /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(span ?? '');
    if (match) hours[index] = [match[1], match[2]];
  }
  return hours;
}

/**
 * Overlays the live branch data on the site's store panels (which own the design: photos, copy).
 * A panel matches a branch by normalized name. When the API lists any branch, contact data
 * (phone, hours, time zone) comes only from it: a panel with no matching branch loses the
 * placeholder values instead of showing made-up ones. An empty list keeps the static data.
 */
export function mergeBranches(
  panels: readonly StorePanel[],
  branches: readonly RemoteBranch[],
): readonly StorePanel[] {
  if (branches.length === 0) return panels;
  const byName = new Map(branches.map((branch) => [normalizeName(branch.name), branch]));
  return panels.map((panel) => {
    const branch = byName.get(normalizeName(panel.name));
    const base = { ...panel, phone: undefined, hours: undefined, timeZone: undefined };
    if (!branch) return base;
    return {
      ...base,
      noteLocation: branch.address ?? panel.noteLocation,
      phone: branch.phone ?? undefined,
      hours: toStoreHours(branch.opening_hours),
      timeZone: branch.timezone ?? undefined,
    };
  });
}

export async function fetchBranches(
  baseUrl: string,
  { fetchImpl = fetch, timeoutMs = 4000 }: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<readonly RemoteBranch[] | null> {
  const root = baseUrl.trim().replace(/\/+$/, '');
  if (!root) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${root}/public/v1/branches`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    return response.ok ? parseBranches(await response.json()) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
