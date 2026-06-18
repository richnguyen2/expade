'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingData, useCreateBusinessFromRequest } from '@/hooks';
import type { ServiceInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import OnboardServices from '@/components/onboard/OnboardServices';
import OnboardWorkers from '@/components/onboard/OnboardWorkers';
import { ShieldCheck, FileText, BadgeCheck, Loader2 } from 'lucide-react';

interface OnboardPageProps {
  params: Promise<{ id: string }>;
}

export default function OnboardPage({ params }: OnboardPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [description, setDescription] = useState('');
  const [services, setServices] = useState<ServiceInput[]>([
    { name: '', description: '', price: 0, durationInMinutes: 0 },
  ]);
  const [workers, setWorkers] = useState<{ email: string; role: string }[]>([]);

  const { data: requestData, isLoading, error } = useOnboardingData(id);
  const mutation = useCreateBusinessFromRequest();

  // Services
  const addService = () =>
    setServices([...services, { name: '', description: '', price: 0, durationInMinutes: 0 }]);
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  const updateService = (
    index: number,
    field: 'name' | 'description' | 'price' | 'durationInMinutes',
    value: string,
  ) => {
    setServices((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        if (field === 'price' || field === 'durationInMinutes') return { ...s, [field]: Number(value) || 0 };
        return { ...s, [field]: value };
      }),
    );
  };

  // Workers
  const addWorker = () => setWorkers([...workers, { email: '', role: 'Staff' }]);
  const removeWorker = (index: number) => setWorkers(workers.filter((_, i) => i !== index));
  const updateWorker = (index: number, email: string) => {
    setWorkers(workers.map((w, i) => (i === index ? { ...w, email } : w)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      { requestId: id, description, services, workers },
      {
        onSuccess: () => router.push('/home'),
        onError: (err) => alert(err.message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted/30 text-muted-foreground">
        <Loader2 className="size-9 animate-spin text-primary" />
        <p className="text-sm font-medium">Verifying your activation link…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-destructive">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const verified = [
    { label: 'Category', value: requestData?.categoryName, full: false },
    { label: 'Phone', value: requestData?.phone, full: false },
    { label: 'Business address', value: requestData?.address, full: true },
  ];

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="relative overflow-hidden bg-primary px-8 py-10 text-primary-foreground">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 left-24 size-64 rounded-full bg-black/10" />
          <div className="relative flex items-center justify-between gap-6">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
                Step 2 · Activation
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Launch your marketplace profile</h1>
              <p className="mt-1.5 text-sm text-primary-foreground/85">
                Finishing setup for <span className="font-bold underline decoration-white/40">{requestData?.name}</span>
              </p>
            </div>
            <ShieldCheck className="hidden size-16 shrink-0 text-white/20 sm:block" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Verified info */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <BadgeCheck className="size-5 text-primary" /> Verified information
            </h2>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:grid-cols-2">
              {verified.map((item) => (
                <div key={item.label} className={item.full ? 'sm:col-span-2' : undefined}>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-3 border-t border-border pt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <FileText className="size-5 text-primary" /> Profile description
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="description">Tell clients about your business</Label>
              <Textarea
                id="description"
                required
                rows={4}
                placeholder="Share your background, specialties, and hours of operation…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

          <OnboardServices
            services={services}
            onAdd={addService}
            onRemove={removeService}
            onUpdate={updateService}
          />

          <OnboardWorkers
            workers={workers}
            onAdd={addWorker}
            onRemove={removeWorker}
            onUpdate={updateWorker}
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Creating your profile…
              </>
            ) : (
              'Publish live profile'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
