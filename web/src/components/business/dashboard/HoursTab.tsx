'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OnboardHours from '@/components/onboard/OnboardHours';
import { useBusinessHours, useUpdateBusinessHours } from '@/hooks';
import type { BusinessHoursInput } from '@/types';

const DEFAULT_HOURS: BusinessHoursInput[] = [
  { dayOfWeek: 0, isOpen: false, open: '09:00', close: '17:00' },
  { dayOfWeek: 1, isOpen: true,  open: '09:00', close: '17:00' },
  { dayOfWeek: 2, isOpen: true,  open: '09:00', close: '17:00' },
  { dayOfWeek: 3, isOpen: true,  open: '09:00', close: '17:00' },
  { dayOfWeek: 4, isOpen: true,  open: '09:00', close: '17:00' },
  { dayOfWeek: 5, isOpen: true,  open: '09:00', close: '17:00' },
  { dayOfWeek: 6, isOpen: false, open: '10:00', close: '15:00' },
];

interface HoursTabProps {
  businessId: string;
}

export default function HoursTab({ businessId }: HoursTabProps) {
  const { data: saved, isLoading } = useBusinessHours(businessId);
  const update = useUpdateBusinessHours(businessId);

  const [hours, setHours] = useState<BusinessHoursInput[]>(DEFAULT_HOURS);

  // Populate from server once loaded
  useEffect(() => {
    if (saved && saved.length === 7) setHours(saved);
  }, [saved]);

  const handleSave = () => {
    update.mutate(hours);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading hours…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <OnboardHours hours={hours} onChange={setHours} />

        <div className="mt-6 flex items-center justify-between">
          {update.isSuccess && (
            <p className="text-sm font-medium text-primary">Hours saved successfully.</p>
          )}
          {update.isError && (
            <p className="text-sm font-medium text-destructive">Failed to save hours.</p>
          )}
          {!update.isSuccess && !update.isError && <span />}

          <Button
            onClick={handleSave}
            disabled={update.isPending}
            className="h-10 rounded-xl px-5 text-sm font-semibold"
          >
            {update.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" /> Save hours
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
