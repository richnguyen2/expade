'use client';

import { useState } from 'react';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateBusiness } from '@/hooks';
import type { BusinessResponse } from '@/types';

interface SettingsTabProps {
  business: BusinessResponse;
}

export default function SettingsTab({ business }: SettingsTabProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const updateMutation = useUpdateBusiness(business.id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate(
      {
        phone: formData.get('phone') as string,
        description: formData.get('description') as string,
      },
      {
        onSuccess: () => {
          setSuccessMessage('Settings saved successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        },
      },
    );
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
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-border pt-8">
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={business.phone} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={business.description}
            className="mt-1.5"
          />
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
