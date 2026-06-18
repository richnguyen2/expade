import { CalendarDays, MousePointerClick, Users, TrendingUp } from 'lucide-react';
import type { BusinessResponse } from '@/types';

interface OverviewTabProps {
  business: BusinessResponse;
}

export default function OverviewTab({ business }: OverviewTabProps) {
  const metrics = [
    { icon: CalendarDays, label: 'Appointments', value: '124', delta: '+12% this week', sample: true },
    { icon: MousePointerClick, label: 'Page Views', value: '892', delta: '+5% this week', sample: true },
    {
      icon: Users,
      label: 'Active Workers',
      value: String(business.workers.length),
      delta: null,
      sample: false,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-5 text-primary" />
                {metric.label}
              </div>
              {metric.sample && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Sample
                </span>
              )}
            </div>
            <div className="mt-3 text-3xl font-extrabold text-foreground">{metric.value}</div>
            {metric.delta && (
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
                <TrendingUp className="size-3.5" />
                {metric.delta}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
