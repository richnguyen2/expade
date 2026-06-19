'use client';

import { use, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBusiness, useAvailability, useCreateAppointment } from '@/hooks';
import { formatTimeInZone } from '@/lib/datetime';

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function BookingContent({ serviceId }: { serviceId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const businessId = searchParams.get('businessId') ?? '';

  const [date, setDate] = useState(todayString());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: business, isPending: businessLoading } = useBusiness(businessId);
  const service = business?.services.find((s) => s.id === serviceId);

  const { data: slots, isFetching: slotsLoading } = useAvailability(businessId, serviceId, date);
  const createAppointment = useCreateAppointment();

  if (!businessId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-destructive">Missing business context.</p>
          <Link href="/home" className="mt-4 inline-block">
            <Button variant="outline" className="h-10 rounded-xl px-5 text-sm font-semibold">
              Back to discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (businessLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading service details…</p>
      </div>
    );
  }

  if (!business || !service) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-destructive">Service not found.</p>
          <Link href="/home" className="mt-4 inline-block">
            <Button variant="outline" className="h-10 rounded-xl px-5 text-sm font-semibold">
              Back to discover
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selectedSlot) return;
    createAppointment.mutate(
      { serviceId, startDateTime: selectedSlot },
      {
        onSuccess: () => router.push('/appointments'),
        onError: (err) => alert(err.message),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <Link
        href={`/businesses/${businessId}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to {business?.name}
      </Link>

      {/* Service summary */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{service.name}</h1>
        {service.description && (
          <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <DollarSign className="size-4 text-primary" />
            ${service.price}
          </span>
          {service.durationInMinutes > 0 && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" />
              {service.durationInMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Date picker */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label className="flex items-center gap-2 text-base font-bold text-foreground">
          <CalendarDays className="size-5 text-primary" />
          Pick a date
        </label>
        <input
          type="date"
          value={date}
          min={todayString()}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="mt-3 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-auto"
        />
      </div>

      {/* Slot picker */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Available times</h2>

        {slotsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Checking availability…
          </div>
        ) : !slots || slots.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No available slots on this date. Try another day.
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedSlot === slot
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                {formatTimeInZone(slot, business.timeZoneId)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirm */}
      <Button
        onClick={handleConfirm}
        disabled={!selectedSlot || createAppointment.isPending}
        className="h-12 w-full rounded-xl text-base font-semibold"
      >
        {createAppointment.isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" /> Booking…
          </>
        ) : selectedSlot ? (
          `Request appointment at ${formatTimeInZone(selectedSlot, business.timeZoneId)}`
        ) : (
          'Select a time to continue'
        )}
      </Button>
    </div>
  );
}

export default function BookingPage({ params }: BookingPageProps) {
  const { id: serviceId } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading…</p>
        </div>
      }
    >
      <BookingContent serviceId={serviceId} />
    </Suspense>
  );
}
