'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteBusiness } from '@/hooks';

interface DeleteBusinessCardProps {
  businessId: string;
  businessName: string;
}

export default function DeleteBusinessCard({ businessId, businessName }: DeleteBusinessCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const deleteMutation = useDeleteBusiness(businessId);

  const canDelete = confirmText.trim() === businessName;

  const close = () => {
    if (deleteMutation.isPending) return;
    setIsOpen(false);
    setConfirmText('');
  };

  const handleDelete = () => {
    if (!canDelete) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => router.push('/my-businesses'),
    });
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <h2 className="text-xl font-bold text-foreground">Delete this business</h2>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Permanently deletes <strong className="text-foreground">{businessName}</strong>, along with its
            services, team, operating hours, and every appointment. Clients with upcoming bookings will be
            notified that their appointment is cancelled. <strong className="text-foreground">This cannot be
            undone.</strong>
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="destructive" onClick={() => setIsOpen(true)} className="h-11 rounded-xl px-6 font-semibold">
          Delete business
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {businessName}?</DialogTitle>
            <DialogDescription>
              This permanently removes the business, its services, team, hours, and all appointments, and
              notifies any clients with upcoming bookings. This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Type <strong className="text-foreground">{businessName}</strong> to confirm
            </Label>
            <Input
              id="confirm-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={businessName}
              autoComplete="off"
            />
          </div>

          {deleteMutation.isError && (
            <p className="text-sm text-destructive">Failed to delete the business. Please try again.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={close} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              {deleteMutation.isPending ? 'Deleting…' : 'Delete business'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
