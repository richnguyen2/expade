'use client';

import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ServiceResponse } from '@/types';
import { useServiceMutations } from '@/hooks';

interface EditServiceModalProps {
  businessId: string;
  service: ServiceResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditServiceModal({ businessId, service, isOpen, onClose }: EditServiceModalProps) {
  const { updateService } = useServiceMutations(businessId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!service) return;
    const formData = new FormData(e.currentTarget);
    updateService.mutate(
      {
        serviceId: service.id,
        data: {
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          price: Number(formData.get('price')) || 0,
          durationInMinutes: Number(formData.get('durationInMinutes')) || 0,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit service</DialogTitle>
          <DialogDescription>Update the details for this service.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Service name</Label>
            <Input id="edit-name" name="name" required defaultValue={service?.name} className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={service?.price}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="edit-duration">Duration (min)</Label>
              <Input
                id="edit-duration"
                name="durationInMinutes"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={service?.durationInMinutes}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={service?.description}
              className="mt-1.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateService.isPending}>
              {updateService.isPending && <Loader2 className="size-4 animate-spin" />}
              {updateService.isPending ? 'Updating…' : 'Update service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
