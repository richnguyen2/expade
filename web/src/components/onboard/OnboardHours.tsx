'use client';

import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { BusinessHoursInput } from '@/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface OnboardHoursProps {
  hours: BusinessHoursInput[];
  onChange: (hours: BusinessHoursInput[]) => void;
}

export default function OnboardHours({ hours, onChange }: OnboardHoursProps) {
  const update = (index: number, patch: Partial<BusinessHoursInput>) => {
    onChange(hours.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  };

  return (
    <section className="space-y-3 border-t border-border pt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <Clock className="size-5 text-primary" /> Weekly hours
      </h2>
      <p className="text-sm text-muted-foreground">
        Set your opening hours for each day. Clients will only see available booking slots within
        these times.
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        {hours.map((day, i) => (
          <div
            key={day.dayOfWeek}
            className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-nowrap"
          >
            {/* Day toggle */}
            <label className="flex w-36 shrink-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="accent-primary size-4 cursor-pointer"
                checked={day.isOpen}
                onChange={(e) => update(i, { isOpen: e.target.checked })}
              />
              <span className="text-sm font-semibold text-foreground">
                {DAY_NAMES[day.dayOfWeek]}
              </span>
            </label>

            {day.isOpen ? (
              <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs text-muted-foreground">Open</Label>
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => update(i, { open: e.target.value })}
                    className="h-9 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <span className="mt-4 text-muted-foreground">–</span>
                <div className="flex flex-col gap-0.5">
                  <Label className="text-xs text-muted-foreground">Close</Label>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => update(i, { close: e.target.value })}
                    className="h-9 rounded-lg border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
