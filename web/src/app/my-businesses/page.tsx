'use client';

import Link from 'next/link';
import { Building2, UserCog, ChevronRight, Plus } from 'lucide-react';
import { useMyBusinesses } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyBusinessesPage() {
  const { data: businesses = [], isLoading, error } = useMyBusinesses();

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Businesses</h1>
          <p className="mt-1 text-muted-foreground">Manage the businesses you own or work for.</p>
        </div>
        <Link href="/business-signup">
          <Button className="h-10 rounded-xl px-4 text-sm font-semibold">
            <Plus className="size-4" />
            New business
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted/50" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm font-medium text-destructive">
          Error loading your businesses.
        </div>
      ) : businesses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Building2 className="size-7" />
          </span>
          <h3 className="text-lg font-bold text-foreground">No businesses yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            You aren&apos;t associated with any business yet. List one to get started.
          </p>
          <Link href="/business-signup" className="mt-1">
            <Button className="h-10 rounded-xl px-5 text-sm font-semibold">List your business</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {businesses.map((biz) => (
            <Link
              key={biz.id}
              href={`/my-businesses/dashboard/${biz.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg font-extrabold text-primary">
                  {biz.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {biz.name}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{biz.categoryName}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <UserCog className="size-3" />
                  {biz.role}
                </Badge>
                <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
