import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BusinessHoursResponse, BusinessResponse } from '@/types';

interface BusinessHeroProps {
  business: BusinessResponse;
  hours: BusinessHoursResponse[];
  /** Distance from the user's set location, in miles. Undefined when no location is set. */
  distanceMiles?: number;
}
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessHero({ business, hours, distanceMiles }: BusinessHeroProps) {
  const formatTime = (time: string) => {
    if (!time) return 'Closed'; // Fallback in case a time is missing

    const [hoursStr, minutes] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${minutes} ${ampm}`;
  };
  const sortedHours = [...hours].sort((a, b) => {
    const weightA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const weightB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return weightA - weightB;
  });
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Banner */}
      <div className="relative bg-primary px-6 py-14 text-primary-foreground sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full bg-black/10" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-3xl font-extrabold text-primary shadow-sm">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Badge className="bg-white/15 text-primary-foreground">{business.categoryName}</Badge>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{business.name}</h1>
            {distanceMiles != null && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90">
                <MapPin className="size-4" />
                <span className="font-medium text-primary-foreground/80">
                  {distanceMiles.toFixed(1)} mi away
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Location
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{business.address}</p>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-8">
            Contact
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{business.phone}</p>
        </div>
        <div className="bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hours
          </div>
          <div className="mt-2 grid gap-x-8 gap-y-2 sm:grid-cols-2 sm:grid-rows-4 sm:grid-flow-col">
            {sortedHours.map((day) => (
              <div
                key={day.dayOfWeek}
                className="flex justify-between sm:justify-start sm:gap-2"
              >
                <span className="text-sm font-semibold text-foreground w-24">
                  {DAY_NAMES[day.dayOfWeek]}
                </span>
                {day.isOpen ? (
                  <span className="text-sm text-foreground">
                    {formatTime(day.open)} - {formatTime(day.close)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}