'use client';

import { Plus, Trash2, Briefcase, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ServiceInput } from '@/types';

interface OnboardServicesProps {
  services: ServiceInput[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: 'name' | 'description' | 'price' | 'durationInMinutes',
    value: string,
  ) => void;
}

export default function OnboardServices({ services, onAdd, onRemove, onUpdate }: OnboardServicesProps) {
  return (
    <section className="space-y-4 border-t border-border pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Briefcase className="size-5 text-primary" /> Offered services
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-9 rounded-lg">
          <Plus className="size-4" /> Add service
        </Button>
      </div>

      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex-1 space-y-2.5">
              <div className="flex gap-2.5">
                <Input
                  required
                  placeholder="Service name (e.g. Brake Pad Replacement)"
                  value={service.name}
                  onChange={(e) => onUpdate(index, 'name', e.target.value)}
                  className="h-10 flex-1 bg-card"
                />
                <div className="relative w-32 shrink-0">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={service.price || ''}
                    onChange={(e) => onUpdate(index, 'price', e.target.value)}
                    className="h-10 bg-card pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2.5">
                <Input
                  required
                  placeholder="Short description of this service"
                  value={service.description}
                  onChange={(e) => onUpdate(index, 'description', e.target.value)}
                  className="h-10 flex-1 bg-card"
                />
                <div className="relative w-32 shrink-0">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Mins"
                    value={service.durationInMinutes || ''}
                    onChange={(e) => onUpdate(index, 'durationInMinutes', e.target.value)}
                    className="h-10 bg-card pl-8"
                  />
                </div>
              </div>
            </div>
            {services.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                aria-label="Remove service"
                className="self-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
