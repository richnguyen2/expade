'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateBusiness } from '@/hooks';
import { businessSettingsSchema, type BusinessSettingsValues } from '@/lib/validation';
import type { BusinessResponse } from '@/types';

interface SettingsTabProps {
  business: BusinessResponse;
}

export default function SettingsTab({ business }: SettingsTabProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const updateMutation = useUpdateBusiness(business.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessSettingsValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: { phone: business.phone, description: business.description },
  });

  const onSubmit = (values: BusinessSettingsValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    });
  };

  const lockedFields = [
    { label: 'Business name', value: business.name, full: false },
    { label: 'Category', value: business.categoryName, full: false },
    { label: 'Address', value: business.address, full: true },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">Business details</h2>
        {successMessage && (
          <span className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <CheckCircle2 className="size-4" />
            {successMessage}
          </span>
        )}
      </div>

      {/* Locked / verified fields */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {lockedFields.map((field) => (
          <div key={field.label} className={field.full ? 'sm:col-span-2' : undefined}>
            <Label className="flex items-center gap-1.5 text-muted-foreground">
              {field.label}
              <Lock className="size-3" />
            </Label>
            <Input value={field.value} disabled className="mt-1.5 cursor-not-allowed" />
          </div>
        ))}
      </div>

      {/* Editable fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 border-t border-border pt-8" noValidate>
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} className="mt-1.5" />
          {errors.phone && <p className="mt-1 text-xs font-medium text-destructive">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            aria-invalid={!!errors.description}
            {...register('description')}
            className="mt-1.5"
          />
          {errors.description && (
            <p className="mt-1 text-xs font-medium text-destructive">{errors.description.message}</p>
          )}
        </div>

        {updateMutation.isError && (
          <p className="text-sm text-destructive">Failed to save changes. Please try again.</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending} className="h-11 rounded-xl px-6 font-semibold">
            {updateMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
