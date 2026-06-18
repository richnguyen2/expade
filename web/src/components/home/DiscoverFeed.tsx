'use client';

import { useSearchParams } from 'next/navigation';
import { useBusinesses, useCategories } from '@/hooks';
import BusinessCard from '@/components/business/BusinessCard';
import BusinessRow from '@/components/home/BusinessRow';
import { buildFeedSections } from '@/components/home/feed';
import { Store } from 'lucide-react';

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Store className="size-7" />
      </span>
      <h3 className="text-lg font-bold text-foreground">No businesses here yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'No providers in this category yet — try another, or check back soon.'
          : 'New providers are joining all the time. Check back soon!'}
      </p>
    </div>
  );
}

export default function DiscoverFeed() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const businessesQuery = useBusinesses();
  const categoriesQuery = useCategories();

  if (businessesQuery.isPending || categoriesQuery.isPending) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-muted/50" />
        ))}
      </div>
    );
  }

  if (businessesQuery.error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center text-sm font-medium text-destructive">
        Failed to load the marketplace. Please try again.
      </div>
    );
  }

  const businesses = businessesQuery.data;
  const categories = categoriesQuery.data ?? [];

  // Focused view: a single category selected from the CategoryBar -> grid.
  if (activeCategory) {
    const filtered = businesses.filter((b) => b.categoryId === activeCategory);
    const categoryName = categories.find((c) => c.id === activeCategory)?.name ?? 'Category';

    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{categoryName}</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'provider' : 'providers'}
          </p>
        </div>
        {filtered.length === 0 ? (
          <EmptyState filtered />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    );
  }

  // Default view: curated multi-row feed.
  const sections = buildFeedSections(businesses, categories);

  if (sections.length === 0) {
    return <EmptyState filtered={false} />;
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <BusinessRow key={section.id} section={section} />
      ))}
    </div>
  );
}
