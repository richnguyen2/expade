'use client';

import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServiceMutations } from '@/hooks';

interface AddServiceModalProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddServiceModal({ businessId, isOpen, onClose }: AddServiceModalProps) {
  const { addService } = useServiceMutations(businessId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addService.mutate(
      {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        durationInMinutes: Number(formData.get('durationInMinutes')) || 0,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new service</DialogTitle>
          <DialogDescription>Create a service customers can book.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="add-name">Service name</Label>
            <Input id="add-name" name="name" required placeholder="e.g. Deep Cleaning" className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="add-price">Price ($)</Label>
              <Input id="add-price" name="price" type="number" min="0" step="0.01" required placeholder="0.00" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="add-duration">Duration (min)</Label>
              <Input id="add-duration" name="durationInMinutes" type="number" min="0" step="1" required placeholder="30" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="add-description">Description</Label>
            <Textarea id="add-description" name="description" rows={3} placeholder="Briefly describe this service…" className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addService.isPending}>
              {addService.isPending && <Loader2 className="size-4 animate-spin" />}
              {addService.isPending ? 'Saving…' : 'Save service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
