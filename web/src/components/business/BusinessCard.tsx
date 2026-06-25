import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';
import type { BusinessListItemResponse } from '@/types';

interface BusinessCardProps {
  business: BusinessListItemResponse;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/businesses/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* Banner */}
      <div className="relative flex h-32 items-center justify-center bg-primary/10">
        <div className="grid size-16 place-items-center rounded-2xl bg-card text-2xl font-extrabold text-primary shadow-sm ring-1 ring-border">
          {business.name.charAt(0).toUpperCase()}
        </div>
        {business.distanceMiles != null && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-card px-2 py-1 text-xs font-bold text-foreground shadow-sm">
            <MapPin className="size-3.5 text-primary" />
            {business.distanceMiles.toFixed(1)} mi
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {business.categoryName}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
            {business.name}
          </h3>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {business.description || 'No description provided yet.'}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-1.5 border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{business.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0" />
          <span>{business.phone}</span>
        </div>
      </div>
    </Link>
  );
}
