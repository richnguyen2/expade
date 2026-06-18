import { Search, CalendarCheck, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover',
    description: 'Browse vetted local providers by category, location, and rating — all in one place.',
  },
  {
    icon: CalendarCheck,
    title: 'Book',
    description: 'Pick a service and a time that works for you. Confirm in seconds, no phone tag.',
  },
  {
    icon: Sparkles,
    title: 'Relax',
    description: 'Show up and get it done. Manage and rebook your appointments anytime.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-col gap-3 text-center">
        <span className="mx-auto text-xs font-bold uppercase tracking-wider text-primary">How it works</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Booking a service has never been this easy
        </h2>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <span className="absolute right-6 top-6 text-5xl font-extrabold text-muted/70">
                {index + 1}
              </span>
              <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Icon className="size-7" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-foreground">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
