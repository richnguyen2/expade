'use client';

import { useCategories } from '@/hooks';
import { iconForCategory } from '@/lib/categoryIcons';

export default function LandingCategories() {
  const { data: categories, isPending } = useCategories();

  return (
    <section id="categories" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Every service, one marketplace
          </h2>
          <p className="text-muted-foreground">Browse the categories available on Expade and find exactly who you need.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-[132px] animate-pulse flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="size-12 rounded-xl bg-muted" />
                  <div className="mt-2 h-4 w-24 rounded bg-muted" />
                </div>
              ))
            : categories?.map((category) => {
                const Icon = iconForCategory(category.name);
                return (
                  <div
                    key={category.id}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{category.name}</span>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
}
