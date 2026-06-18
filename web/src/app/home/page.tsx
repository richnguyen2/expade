import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CategoryBar from '@/components/home/CategoryBar';
import DiscoverFeed from '@/components/home/DiscoverFeed';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Promo banner */}
      <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-32 size-52 rounded-full bg-black/10" />
        <div className="relative max-w-xl">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Find and book trusted local services
          </h1>
          <p className="mt-3 text-primary-foreground/85">
            Discover top-rated providers near you and reserve a time in seconds.
          </p>
          <Link href="/business-signup" className="mt-6 inline-block">
            <Button className="h-11 rounded-xl bg-white px-6 text-sm font-semibold text-primary hover:bg-white/90">
              List your business
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Category filter */}
      <Suspense fallback={<div className="h-10" />}>
        <CategoryBar />
      </Suspense>

      {/* Discovery feed (curated rows, or a filtered grid when a category is selected) */}
      <Suspense fallback={<div className="h-72" />}>
        <DiscoverFeed />
      </Suspense>
    </div>
  );
}
