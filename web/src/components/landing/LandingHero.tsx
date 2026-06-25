import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star, CarFront, Sparkles, Wrench, ArrowRight } from 'lucide-react';

const sampleCards = [
  { name: 'Apex Auto Care', category: 'Automotive', rating: '4.9', icon: CarFront, accent: 'bg-blue-50 text-blue-600' },
  { name: 'Glow Beauty Bar', category: 'Beauty & Wellness', rating: '4.8', icon: Sparkles, accent: 'bg-pink-50 text-pink-600' },
  { name: 'Sterling Home Repair', category: 'Home Services', rating: '5.0', icon: Wrench, accent: 'bg-amber-50 text-amber-600' },
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glow backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
        {/* Left: copy + actions */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            The local services marketplace
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Book trusted local
            <span className="text-primary"> services</span> in seconds.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            From auto repair to home cleaning to wellness — discover vetted providers near
            you, compare them, and lock in an appointment without the phone tag.
          </p>

          {/* Search bar (visual entry point) */}
          <div className="mt-8 flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-2.5 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2.5 px-3">
              <Search className="size-5 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">What service do you need?</span>
            </div>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex flex-1 items-center gap-2.5 px-3">
              <MapPin className="size-5 shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your location</span>
            </div>
            <SignUpButton mode="modal">
              <Button className="h-11 rounded-xl px-5 text-sm font-semibold">
                Search
              </Button>
            </SignUpButton>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <SignUpButton mode="modal">
              <Button className="h-12 rounded-xl px-7 text-base font-semibold shadow-sm">
                Get started — it&apos;s free
                <ArrowRight className="size-4" />
              </Button>
            </SignUpButton>
            <a href="#how-it-works">
              <Button variant="outline" className="h-12 rounded-xl px-7 text-base font-semibold">
                See how it works
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Join <span className="font-semibold text-foreground">thousands</span> booking local services on Expade.
          </p>
        </div>

        {/* Right: floating card cluster */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="space-y-4">
            {sampleCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.name}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ marginLeft: i === 1 ? 'auto' : undefined, width: i === 1 ? '92%' : '100%' }}
                >
                  <div className={`grid size-14 shrink-0 place-items-center rounded-xl ${card.accent}`}>
                    <Icon className="size-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground">{card.name}</p>
                    <p className="text-sm text-muted-foreground">{card.category}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-sm font-bold text-foreground">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {card.rating}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
