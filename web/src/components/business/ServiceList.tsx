import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ServiceResponse } from '@/types';

interface ServiceListProps {
  businessId: string;
  services: ServiceResponse[];
}

export default function ServiceList({ businessId, services }: ServiceListProps) {
  return (
    <section id="services" className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Services</h2>
        <p className="text-sm text-muted-foreground">Pick a service to book an appointment.</p>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Sparkles className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">No services listed for this business yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{service.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description || 'No description provided for this service.'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-extrabold text-foreground">${service.price}</p>
                  {service.durationInMinutes > 0 && (
                    <p className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      {service.durationInMinutes} min
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Link href={`/appointments/${service.id}?businessId=${businessId}`}>
                  <Button className="h-10 rounded-xl px-5 text-sm font-semibold">Book appointment</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
