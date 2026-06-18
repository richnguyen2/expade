'use client';

import { useState } from 'react';
import { List, Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServiceMutations } from '@/hooks';
import AddServiceModal from '@/components/business/AddServiceModal';
import EditServiceModal from '@/components/business/EditServiceModal';
import type { BusinessResponse, ServiceResponse } from '@/types';

interface ServicesTabProps {
  business: BusinessResponse;
}

export default function ServicesTab({ business }: ServicesTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceResponse | null>(null);
  const { deleteService } = useServiceMutations(business.id);

  const hasServices = business.services.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage services</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, and price the services you offer.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="h-10 rounded-xl px-4 text-sm font-semibold">
          <Plus className="size-4" />
          Add service
        </Button>
      </div>

      <div className="p-6">
        {!hasServices ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <List className="size-6" />
            </span>
            <h3 className="text-lg font-bold text-foreground">No services yet</h3>
            <p className="text-sm text-muted-foreground">Create your first service to start taking bookings.</p>
            <Button
              variant="ghost"
              onClick={() => setIsAddOpen(true)}
              className="mt-1 h-9 px-3 text-sm font-semibold text-primary"
            >
              <Plus className="size-4" />
              Create a service
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {business.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border p-5 transition-colors hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground">{service.name}</h3>
                    <Badge variant="secondary">${service.price?.toFixed(2) ?? '0.00'}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      {service.durationInMinutes} min
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{service.description}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingService(service)}
                    aria-label="Edit service"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteService.mutate(service.id)}
                    disabled={deleteService.isPending}
                    aria-label="Delete service"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddServiceModal businessId={business.id} isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditServiceModal
        businessId={business.id}
        service={editingService}
        isOpen={Boolean(editingService)}
        onClose={() => setEditingService(null)}
      />
    </div>
  );
}
