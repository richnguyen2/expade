'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WeeklyCalendar from '@/components/business/dashboard/WeeklyCalendar';
import AppointmentModal from '@/components/business/dashboard/AppointmentModal';
import BlockTimeModal from '@/components/business/dashboard/BlockTimeModal';
import BlockedTimeModal from '@/components/business/dashboard/BlockedTimeModal';
import {
  useBusinessAppointments,
  useUpdateBusinessAppointmentStatus,
  useBusinessHours,
  useBlockedTimes,
} from '@/hooks';
import { AppointmentStatus } from '@/types';
import type { AppointmentResponse, BlockedTimeResponse, BusinessResponse } from '@/types';
import { formatDateTimeInZone } from '@/lib/datetime';
import { todayKeyInZone } from '@/lib/calendar';

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

interface ScheduleTabProps {
  business: BusinessResponse;
}

export default function ScheduleTab({ business }: ScheduleTabProps) {
  const tz = business.timeZoneId;
  const { data: appointments, isLoading } = useBusinessAppointments(business.id);
  const { data: blocks, isLoading: blocksLoading } = useBlockedTimes(business.id);
  const { data: hours } = useBusinessHours(business.id);
  const updateStatus = useUpdateBusinessAppointmentStatus(business.id);

  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockedTimeResponse | null>(null);
  const [blockPrefill, setBlockPrefill] = useState<{ date: string; start: string } | null>(null);

  const setStatus = (id: string, status: AppointmentStatus) =>
    updateStatus.mutate({ id, status });
  const isUpdating = (id: string) =>
    updateStatus.isPending && updateStatus.variables?.id === id;

  if (isLoading || blocksLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading schedule…</span>
      </div>
    );
  }

  const all = appointments ?? [];
  const requests = all.filter((a) => a.status === AppointmentStatus.Pending);
  const upcoming = all.filter((a) => a.status === AppointmentStatus.Confirmed);
  const past = all.filter(
    (a) => a.status === AppointmentStatus.Completed || a.status === AppointmentStatus.Cancelled,
  );

  const Row = ({ appt }: { appt: AppointmentResponse }) => {
    const busy = isUpdating(appt.id);
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-foreground">{appt.serviceName}</h4>
            <Badge variant={statusVariant(appt.status)} className="capitalize">
              {appt.status}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground">{appt.clientName}</p>
          <p className="text-sm text-muted-foreground">
            {formatDateTimeInZone(appt.startDateTime, appt.timeZoneId)}
            {' · '}${appt.price}
            {appt.durationInMinutes > 0 && ` · ${appt.durationInMinutes} min`}
          </p>
        </div>

        {appt.status === AppointmentStatus.Pending && (
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => setStatus(appt.id, AppointmentStatus.Confirmed)}
              className="rounded-xl text-sm font-semibold"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setStatus(appt.id, AppointmentStatus.Cancelled)}
              className="rounded-xl text-sm font-semibold text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <X className="size-4" />
              Decline
            </Button>
          </div>
        )}

        {appt.status === AppointmentStatus.Confirmed && (
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setStatus(appt.id, AppointmentStatus.Completed)}
              className="rounded-xl text-sm font-semibold"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Mark complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setStatus(appt.id, AppointmentStatus.Cancelled)}
              className="rounded-xl text-sm font-semibold text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Weekly calendar */}
      <WeeklyCalendar
        business={business}
        appointments={all}
        blocks={blocks ?? []}
        hours={hours}
        onSelectAppointment={setSelectedAppt}
        onSelectBlock={setSelectedBlock}
        onAddBlock={() => setBlockPrefill({ date: todayKeyInZone(tz), start: '12:00' })}
        onBlockSlot={(date, minutes) =>
          setBlockPrefill({
            date,
            start: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
          })
        }
      />

      {/* Requests */}
      {requests.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Requests
            </h3>
            <Badge variant="outline" className="font-bold">{requests.length}</Badge>
          </div>
          {requests.map((a) => <Row key={a.id} appt={a} />)}
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Upcoming
          </h3>
          {upcoming.map((a) => <Row key={a.id} appt={a} />)}
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Past
          </h3>
          {past.map((a) => <Row key={a.id} appt={a} />)}
        </section>
      )}

      {/* Modals */}
      <AppointmentModal
        businessId={business.id}
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
      />

      <BlockedTimeModal
        businessId={business.id}
        timeZoneId={tz}
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
      />

      {blockPrefill && (
        <BlockTimeModal
          key={`${blockPrefill.date}-${blockPrefill.start}`}
          businessId={business.id}
          isOpen
          defaultDate={blockPrefill.date}
          defaultStart={blockPrefill.start}
          onClose={() => setBlockPrefill(null)}
        />
      )}
    </div>
  );
}
