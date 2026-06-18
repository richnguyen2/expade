import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import BusinessCard from '@/components/business/BusinessCard';
import type { FeedSection } from './feed';

interface BusinessRowProps {
  section: FeedSection;
}

/** Renders one feed section as a horizontal, snap-scrolling track of cards. */
export default function BusinessRow({ section }: BusinessRowProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{section.subtitle}</p>
          )}
        </div>
        {section.href && (
          <Link
            href={section.href}
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-[color-mix(in_oklch,var(--primary),black_10%)]"
          >
            See all
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="flex snap-x gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {section.businesses.map((business) => (
          <div key={business.id} className="w-[280px] shrink-0 snap-start">
            <BusinessCard business={business} />
          </div>
        ))}
      </div>
    </section>
  );
}
