'use client';

import { Check, Clock, DollarSign, Loader2, User, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateBusinessAppointmentStatus } from '@/hooks';
import { AppointmentStatus } from '@/types';
import type { AppointmentResponse } from '@/types';
import { formatDateTimeInZone } from '@/lib/datetime';

function statusVariant(
  status: AppointmentStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AppointmentStatus.Confirmed: return 'default';
    case AppointmentStatus.Completed: return 'secondary';
    case AppointmentStatus.Cancelled: return 'destructive';
    default:                          return 'outline';
  }
}

interface AppointmentModalProps {
  businessId: string;
  appointment: AppointmentResponse | null;
  onClose: () => void;
}

export default function AppointmentModal({ businessId, appointment, onClose }: AppointmentModalProps) {
  const updateStatus = useUpdateBusinessAppointmentStatus(businessId);

  const act = (status: AppointmentStatus) => {
    if (!appointment) return;
    updateStatus.mutate({ id: appointment.id, status }, { onSuccess: onClose });
  };

  const open = appointment !== null;
  const pending = appointment?.status === AppointmentStatus.Pending;
  const confirmed = appointment?.status === AppointmentStatus.Confirmed;
  const busy = updateStatus.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {appointment && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{appointment.serviceName}</DialogTitle>
                <Badge variant={statusVariant(appointment.status)} className="capitalize">
                  {appointment.status}
                </Badge>
              </div>
              <DialogDescription>Appointment details</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1 text-sm">
              <p className="flex items-center gap-2 text-foreground">
                <User className="size-4 text-muted-foreground" />
                <span className="font-medium">{appointment.clientName}</span>
              </p>
              <p className="flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-muted-foreground" />
                {formatDateTimeInZone(appointment.startDateTime, appointment.timeZoneId)}
              </p>
              <p className="flex items-center gap-2 text-foreground">
                <DollarSign className="size-4 text-muted-foreground" />
                ${appointment.price}
                {appointment.durationInMinutes > 0 && ` · ${appointment.durationInMinutes} min`}
              </p>
            </div>

            {pending && (
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                This request is awaiting your response. Accept to confirm the booking.
              </p>
            )}

            {(pending || confirmed) && (
              <div className="flex justify-end gap-2 pt-2">
                {pending && (
                  <>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => act(AppointmentStatus.Cancelled)}
                      className="text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <X className="size-4" /> Decline
                    </Button>
                    <Button disabled={busy} onClick={() => act(AppointmentStatus.Confirmed)}>
                      {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Accept
                    </Button>
                  </>
                )}
                {confirmed && (
                  <>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => act(AppointmentStatus.Cancelled)}
                      className="text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <X className="size-4" /> Cancel
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => act(AppointmentStatus.Completed)}
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Mark complete
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
