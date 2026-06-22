/**
 * Calendar math for the weekly schedule. Everything is computed in the *business's*
 * timezone: an appointment instant is mapped to the wall-clock day + minute it falls on
 * at the shop, so it lands in the right column/row regardless of where the viewer is.
 *
 * Dates are represented as "YYYY-MM-DD" keys (a plain calendar day, not an instant).
 * Day math anchors at noon UTC to stay clear of DST edges.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Wall-clock date-key + minutes-from-midnight of an instant, in the given IANA zone. */
export function zonedDateInfo(iso: string, timeZone: string): { dateKey: string; minutes: number } {
  try {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
        .formatToParts(new Date(iso))
        .map((p) => [p.type, p.value]),
    );
    const hour = Number(parts.hour) % 24;
    return {
      dateKey: `${parts.year}-${parts.month}-${parts.day}`,
      minutes: hour * 60 + Number(parts.minute),
    };
  } catch {
    const d = new Date(iso);
    return {
      dateKey: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      minutes: d.getHours() * 60 + d.getMinutes(),
    };
  }
}

/** Today's date-key in the given zone. */
export function todayKeyInZone(timeZone: string): string {
  return zonedDateInfo(new Date().toISOString(), timeZone).dateKey;
}

/** Shift a date-key by whole days. */
export function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Day of week for a date-key (0 = Sunday). */
export function weekdayOfKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

/** The Sunday date-key of the week containing dateKey. */
export function startOfWeekKey(dateKey: string): string {
  return addDaysKey(dateKey, -weekdayOfKey(dateKey));
}

/** Short weekday + day-of-month for a date-key, e.g. { weekday: "Mon", day: 16 }. */
export function dayKeyLabel(dateKey: string): { weekday: string; day: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return { weekday: dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), day: d };
}

/** A week range label from its Sunday key, e.g. "Jun 16 – 22" or "Jun 28 – Jul 4". */
export function weekRangeLabel(weekStartKey: string): string {
  const endKey = addDaysKey(weekStartKey, 6);
  const [sy, sm, sd] = weekStartKey.split('-').map(Number);
  const [ey, em, ed] = endKey.split('-').map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, sd, 12));
  const end = new Date(Date.UTC(ey, em - 1, ed, 12));
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endStr = end.toLocaleDateString('en-US', {
    month: sm === em ? undefined : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return `${startStr} – ${endStr}`;
}

/** Minutes-from-midnight → "HH:mm". */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${pad(h)}:${pad(m)}`;
}

/** "HH:mm" → minutes-from-midnight. */
export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** A short hour label for the time gutter, e.g. 13 → "1 PM". */
export function hourLabel(hour: number): string {
  const ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${ampm}`;
}
