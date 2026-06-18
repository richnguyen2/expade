import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { BarChart3, CalendarDays, Users, ArrowRight } from 'lucide-react';

const perks = [
  { icon: CalendarDays, label: 'Manage appointments' },
  { icon: Users, label: 'Add workers & teams' },
  { icon: BarChart3, label: 'Track your metrics' },
];

export default function LandingBusinessCTA() {
  return (
    <section id="for-businesses" className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-14">
        {/* decorative rings */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-80 rounded-full bg-black/10" />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider">
              For businesses
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Grow your business on Expade
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/85">
              List your services, reach new customers in your area, and run your bookings
              and team from one simple dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <SignUpButton mode="modal">
                <Button className="h-12 rounded-xl bg-white px-7 text-base font-semibold text-primary shadow-sm hover:bg-white/90">
                  List your business
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>
            </div>
          </div>

          <div className="space-y-3 lg:justify-self-end lg:pl-10">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.label}
                  className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-white/15">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-semibold">{perk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
