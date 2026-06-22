'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateBlockedTime } from '@/hooks';

interface BlockTimeModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Prefill from a calendar click. */
  defaultDate?: string;
  defaultStart?: string;
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

/** One hour after an "HH:mm" string, clamped to 23:59. */
function oneHourAfter(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const end = Math.min(h * 60 + m + 60, 23 * 60 + 59);
  return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
}

export default function BlockTimeModal({
  businessId,
  isOpen,
  onClose,
  defaultDate,
  defaultStart,
}: BlockTimeModalProps) {
  const createBlock = useCreateBlockedTime(businessId);
  const [error, setError] = useState<string | null>(null);

  const initialDate = defaultDate ?? todayString();
  const initialStart = defaultStart ?? '12:00';
  const initialEnd = defaultStart ? oneHourAfter(defaultStart) : '13:00';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const start = formData.get('start') as string;
    const end = formData.get('end') as string;

    if (end <= start) {
      setError('End time must be after the start time.');
      return;
    }

    createBlock.mutate(
      {
        date: formData.get('date') as string,
        start,
        end,
        reason: (formData.get('reason') as string) || undefined,
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(err.message),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Block off time</DialogTitle>
          <DialogDescription>
            Mark a span as unavailable — for breaks, external bookings, or time off. Times are in
            your business&apos;s timezone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="block-date">Date</Label>
            <Input
              id="block-date"
              name="date"
              type="date"
              required
              min={todayString()}
              defaultValue={initialDate}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="block-start">Start</Label>
              <Input id="block-start" name="start" type="time" required defaultValue={initialStart} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="block-end">End</Label>
              <Input id="block-end" name="end" type="time" required defaultValue={initialEnd} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="block-reason">Label (optional)</Label>
            <Input
              id="block-reason"
              name="reason"
              maxLength={80}
              placeholder="e.g. Lunch, External booking"
              className="mt-1.5"
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBlock.isPending}>
              {createBlock.isPending && <Loader2 className="size-4 animate-spin" />}
              {createBlock.isPending ? 'Blocking…' : 'Block time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
