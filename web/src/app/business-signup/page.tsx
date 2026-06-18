'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, useSubmitBusinessRequest } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users,
  CalendarDays,
  BarChart3,
  ArrowRight,
  ChevronDown,
  Loader2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

const benefits: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Users, title: 'Reach new customers', description: 'Get discovered by people searching near you.' },
  { icon: CalendarDays, title: 'Manage bookings', description: 'Handle appointments and services in one place.' },
  { icon: BarChart3, title: 'Track performance', description: 'See how your business is growing over time.' },
];

export default function BusinessSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', categoryId: '', address: '' });

  const { data: categories, isPending: categoriesLoading, error: categoriesError } = useCategories();
  const mutation = useSubmitBusinessRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, {
      onSuccess: () => router.push('/home'),
      onError: (err) => alert('Error: ' + err.message),
    });
  };

  const update = (field: keyof typeof formData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl lg:grid-cols-2">
      {/* Left: brand / value panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full bg-black/10" />

        <div className="relative">
          <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
            Step 1 of 2 · Request
          </span>
          <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight">
            Grow your business on Expade
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/85">
            Tell us a few details to get started. Once approved, you&apos;ll set up your profile and go live.
          </p>

          <ul className="mt-8 space-y-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.title} className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold">{benefit.title}</p>
                    <p className="text-sm text-primary-foreground/80">{benefit.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mt-10 flex items-center gap-2 text-sm font-medium text-primary-foreground/85">
          <ShieldCheck className="size-4" />
          Free to list · Reviewed within 24–48 hours
        </div>
      </aside>

      {/* Right: form */}
      <div className="p-7 sm:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Tell us about your business</h1>
          <p className="mt-1 text-sm text-muted-foreground">All fields are required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              required
              placeholder="e.g. Main Street Auto Shop"
              value={formData.name}
              onChange={(e) => update('name')(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              required
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => update('phone')(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Service category</Label>
            <div className="relative">
              <select
                id="category"
                required
                value={formData.categoryId}
                disabled={categoriesLoading || Boolean(categoriesError)}
                onChange={(e) => update('categoryId')(e.target.value)}
                className={`h-11 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-10 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
                  formData.categoryId === '' ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? 'Loading categories…'
                    : categoriesError
                      ? 'Unable to load categories'
                      : 'Select a primary category'}
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id} className="text-foreground">
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Business address</Label>
            <Input
              id="address"
              required
              placeholder="123 Market St, City, State, ZIP"
              value={formData.address}
              onChange={(e) => update('address')(e.target.value)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">We use this to place you on the map for nearby customers.</p>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="group h-12 w-full rounded-xl text-base font-semibold"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Submitting request…
              </>
            ) : (
              <>
                Submit for verification
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
