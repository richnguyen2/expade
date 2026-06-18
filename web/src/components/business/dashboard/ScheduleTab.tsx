import { CalendarDays } from 'lucide-react';

export default function ScheduleTab() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <CalendarDays className="size-7" />
      </span>
      <h3 className="text-lg font-bold text-foreground">Schedule viewer coming soon</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Once appointments go live, you&apos;ll manage your full booking calendar right here.
      </p>
    </div>
  );
}
