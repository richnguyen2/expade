'use client';

import { Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface OnboardWorkersProps {
  workers: { email: string; role: string }[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, email: string) => void;
}

export default function OnboardWorkers({ workers, onAdd, onRemove, onUpdate }: OnboardWorkersProps) {
  return (
    <section className="space-y-4 border-t border-border pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Users className="size-5 text-primary" /> Team members
          <span className="text-sm font-normal text-muted-foreground">(optional)</span>
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="h-9 rounded-lg">
          <Plus className="size-4" /> Invite worker
        </Button>
      </div>

      {workers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          You&apos;ll automatically be assigned as the Manager. Add staff accounts here if needed.
        </p>
      ) : (
        <div className="space-y-3">
          {workers.map((worker, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                type="email"
                required
                placeholder="staffmember@email.com"
                value={worker.email}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="h-10 flex-1"
              />
              <Badge variant="secondary">Staff</Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemove(index)}
                aria-label="Remove worker"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
