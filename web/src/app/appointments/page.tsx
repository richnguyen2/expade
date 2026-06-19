'use client';

import Link from 'next/link';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyAppointments, useUpdateAppointmentStatus } from '@/hooks';
import { AppointmentStatus } from '@/types';
import type { AppointmentResponse } from '@/types';
import { formatDateTimeInZone } from '@/lib/datetime';

function statusVariant(status: AppointmentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case AppointmentStatus.Confirmed:  return 'default';
    case AppointmentStatus.Completed:  return 'secondary';
    case AppointmentStatus.Cancelled:  return 'destructive';
    default:                           return 'outline';
  }
}

function AppointmentCard({ appt }: { appt: AppointmentResponse }) {
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const canCancel =
    appt.status === AppointmentStatus.Pending || appt.status === AppointmentStatus.Confirmed;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold text-foreground">{appt.serviceName}</h3>
          <Badge variant={statusVariant(appt.status)} className="capitalize">
            {appt.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{appt.businessName}</p>
        <p className="text-sm font-medium text-foreground">
          {formatDateTimeInZone(appt.startDateTime, appt.timeZoneId)}
        </p>
        <p className="text-sm text-muted-foreground">
          ${appt.price}
          {appt.durationInMinutes > 0 && ` · ${appt.durationInMinutes} min`}
          {appt.workerName && ` · with ${appt.workerName}`}
        </p>
      </div>

      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => updateStatus({ id: appt.id, status: AppointmentStatus.Cancelled })}
          className="shrink-0 rounded-xl text-sm font-semibold text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Cancel'}
        </Button>
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useMyAppointments();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading appointments…</p>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Appointments</h1>
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="size-7" />
          </span>
          <div>
            <p className="font-bold text-foreground">No appointments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse services and book your first appointment.
            </p>
          </div>
          <Link href="/home">
            <Button className="h-10 rounded-xl px-5 text-sm font-semibold">Discover services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter(
    (a) => a.status === AppointmentStatus.Pending || a.status === AppointmentStatus.Confirmed,
  );
  const past = appointments.filter(
    (a) => a.status === AppointmentStatus.Completed || a.status === AppointmentStatus.Cancelled,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-0">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Appointments</h1>

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Upcoming
          </h2>
          {upcoming.map((a) => (
            <AppointmentCard key={a.id} appt={a} />
          ))}
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Past
          </h2>
          {past.map((a) => (
            <AppointmentCard key={a.id} appt={a} />
          ))}
        </section>
      )}
    </div>
  );
}
