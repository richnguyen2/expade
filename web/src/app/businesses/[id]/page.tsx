'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useBusiness, useBusinessHours } from '@/hooks';
import { useUserLocation } from '@/context/LocationContext';
import { distanceMiles } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import BusinessHero from '@/components/business/BusinessHero';
import ServiceList from '@/components/business/ServiceList';

interface BusinessPageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessDetailsPage({ params }: BusinessPageProps) {
  const { id } = use(params);
  const { data: business, isPending, error } = useBusiness(id);
  const { data: hours, isLoading } = useBusinessHours(id);
  const { location } = useUserLocation();

  const distance =
    location && business
      ? distanceMiles(location.lat, location.lon, business.latitude, business.longitude)
      : undefined;

  if (isPending || isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading business details…</p>
      </div>
    );
  }

  if (error || !business || !hours) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-foreground">Unable to load business</p>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been removed, or something went wrong. Try heading back to discover.
          </p>
          <Link href="/home" className="mt-6 inline-block">
            <Button className="h-11 rounded-xl px-6 text-sm font-semibold">Back to discover</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/home"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to discover
      </Link>

      <BusinessHero business={business} hours={hours} distanceMiles={distance} />

      {business.description && (
        <section className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">About</h2>
          <p className="leading-relaxed text-muted-foreground">{business.description}</p>
        </section>
      )}

      <ServiceList businessId={business.id} services={business.services} />
    </div>
  );
}
