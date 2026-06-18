'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCategories } from '@/hooks';
import { iconForCategory } from '@/lib/categoryIcons';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';

export default function CategoryBar() {
  const searchParams = useSearchParams();
  const active = searchParams.get('category');

  const { data: categories } = useCategories();

  const pill = (isActive: boolean) =>
    cn(
      'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
      isActive
        ? 'border-primary bg-primary text-primary-foreground'
        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link href="/home" className={pill(!active)}>
        <LayoutGrid className="size-4" />
        All
      </Link>
      {categories?.map((category) => {
        const Icon = iconForCategory(category.name);
        return (
          <Link
            key={category.id}
            href={`/home?category=${category.id}`}
            className={pill(active === category.id)}
          >
            <Icon className="size-4" />
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
