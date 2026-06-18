import { MapPin, Phone, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BusinessResponse } from '@/types';

interface BusinessHeroProps {
  business: BusinessResponse;
}

export default function BusinessHero({ business }: BusinessHeroProps) {
  const facts = [
    { icon: MapPin, label: 'Location', value: business.address },
    { icon: Phone, label: 'Contact', value: business.phone },
    { icon: Sparkles, label: 'Services', value: `${business.services.length} available` },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Banner */}
      <div className="relative bg-primary px-6 py-10 text-primary-foreground sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full bg-black/10" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-white text-3xl font-extrabold text-primary shadow-sm">
            {business.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Badge className="bg-white/15 text-primary-foreground">{business.categoryName}</Badge>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{business.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary-foreground/90">
              <Star className="size-4 fill-amber-300 text-amber-300" />
              4.8
              <span className="text-primary-foreground/60">·</span>
              <span className="font-medium text-primary-foreground/80">Popular local provider</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid gap-px bg-border sm:grid-cols-3">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div key={fact.label} className="bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="size-4 text-primary" />
                {fact.label}
              </div>
              <p className="mt-2 truncate text-sm font-medium text-foreground">{fact.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
