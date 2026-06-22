'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories, useSubmitBusinessRequest } from '@/hooks';
import { businessSignupSchema, type BusinessSignupValues } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddressAutocomplete from '@/components/forms/AddressAutocomplete';
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
  const { data: categories, isPending: categoriesLoading, error: categoriesError } = useCategories();
  const mutation = useSubmitBusinessRequest();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BusinessSignupValues>({
    resolver: zodResolver(businessSignupSchema),
    defaultValues: { name: '', phone: '', categoryId: '', address: '' },
  });

  const onSubmit = (values: BusinessSignupValues) => {
    mutation.mutate(values, { onSuccess: () => router.push('/home') });
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              placeholder="e.g. Main Street Auto Shop"
              aria-invalid={!!errors.name}
              {...register('name')}
              className="h-11"
            />
            {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              aria-invalid={!!errors.phone}
              {...register('phone')}
              className="h-11"
            />
            {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Service category</Label>
            <div className="relative">
              <select
                id="category"
                disabled={categoriesLoading || Boolean(categoriesError)}
                aria-invalid={!!errors.categoryId}
                {...register('categoryId')}
                className="h-11 w-full appearance-none rounded-lg border border-input bg-transparent pl-3 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
            {errors.categoryId && <p className="text-xs font-medium text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Business address</Label>
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <AddressAutocomplete
                  id="address"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={!!errors.address}
                  placeholder="Start typing, then press Find"
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Type your address and press <span className="font-medium">Find</span>, then pick the match — we use it to
              place you on the map.
            </p>
            {errors.address && <p className="text-xs font-medium text-destructive">{errors.address.message}</p>}
          </div>

          {mutation.isError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {mutation.error.message}
            </p>
          )}

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
