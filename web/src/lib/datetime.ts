/**
 * Time formatting helpers. Appointment/slot instants are absolute (UTC under the hood);
 * we always render them in the *business's* timezone — not the viewer's — so "9am at the
 * shop" reads as 9am to everyone. A short zone label (e.g. "CDT") is appended for clarity.
 */

/** "9:00 AM CDT" — the time of an ISO instant in the given IANA zone. */
export function formatTimeInZone(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString('en-US', withZone(timeZone, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }));
}

/** "Thu, Jun 18, 9:00 AM CDT" — full date + time of an ISO instant in the given IANA zone. */
export function formatDateTimeInZone(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleString('en-US', withZone(timeZone, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }));
}

/**
 * Attach the timeZone to Intl options, but only if the runtime accepts it — an unknown IANA id
 * makes Intl throw, so we fall back to the viewer's local zone rather than crash the render.
 */
function withZone(
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatOptions {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return { ...options, timeZone };
  } catch {
    return options;
  }
}
