import { StoreHours } from '../models/store.models';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** true/false in the store's timezone; null when hours are unknown. */
export function isOpenNow(
  hours: StoreHours | undefined,
  timeZone: string,
  now: Date = new Date(),
): boolean | null {
  if (!hours) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const slot = hours[WEEKDAYS.indexOf(get('weekday')) as keyof StoreHours];
  if (!slot) return false;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  return minutes >= toMinutes(slot[0]) && minutes < toMinutes(slot[1]);
}
