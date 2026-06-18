import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BusinessResponse } from '@/types';

interface TeamTabProps {
  business: BusinessResponse;
}

export default function TeamTab({ business }: TeamTabProps) {
  const { workers } = business;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border p-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Team members</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {workers.length} {workers.length === 1 ? 'person' : 'people'} on your team.
          </p>
        </div>
        <span className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          Invites coming soon
        </span>
      </div>

      <div className="p-6">
        {workers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Users className="size-6" />
            </span>
            <h3 className="text-lg font-bold text-foreground">No team members yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Workers added during onboarding appear here. Inviting more is coming soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {workers.map((worker) => {
              const title = worker.jobTitle || 'Team member';
              return (
                <div
                  key={worker.id}
                  className="flex items-center gap-4 rounded-xl border border-border p-4"
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-foreground">{title}</p>
                      <Badge variant="secondary">{worker.role}</Badge>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{worker.email}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
