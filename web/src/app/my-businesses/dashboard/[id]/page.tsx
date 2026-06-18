'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useBusiness } from '@/hooks';
import DashboardTabs from '@/components/business/dashboard/DashboardTabs';

export default function BusinessDashboardPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { data: business, isLoading } = useBusiness(businessId);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading dashboard…</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-medium text-destructive">Business not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{business.name}</h1>
        <p className="mt-1 text-muted-foreground">Manage your metrics, schedule, and business settings.</p>
      </header>

      <Suspense fallback={<div className="h-11" />}>
        <DashboardTabs business={business} />
      </Suspense>
    </div>
  );
}
