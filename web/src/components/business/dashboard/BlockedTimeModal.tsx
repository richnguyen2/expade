'use client';

import { Ban, Clock, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteBlockedTime } from '@/hooks';
import type { BlockedTimeResponse } from '@/types';
import { formatDateTimeInZone, formatTimeInZone } from '@/lib/datetime';

interface BlockedTimeModalProps {
  businessId: string;
  timeZoneId: string;
  block: BlockedTimeResponse | null;
  onClose: () => void;
}

export default function BlockedTimeModal({
  businessId,
  timeZoneId,
  block,
  onClose,
}: BlockedTimeModalProps) {
  const deleteBlock = useDeleteBlockedTime(businessId);

  const remove = () => {
    if (!block) return;
    deleteBlock.mutate(block.id, { onSuccess: onClose });
  };

  return (
    <Dialog open={block !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {block && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="size-4 text-muted-foreground" /> Blocked time
              </DialogTitle>
              <DialogDescription>This span is unavailable for bookings.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-1 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-muted-foreground" />
                {formatDateTimeInZone(block.startDateTime, timeZoneId)} –{' '}
                {formatTimeInZone(block.endDateTime, timeZoneId)}
              </p>
              {block.reason && <p className="text-muted-foreground">{block.reason}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                disabled={deleteBlock.isPending}
                onClick={remove}
                className="text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                {deleteBlock.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Remove block
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
