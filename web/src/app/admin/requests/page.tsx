'use client';

import { RequestStatus } from '@/types';
import { useBusinessRequests, useUpdateRequestStatus } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, Inbox } from 'lucide-react';

const statusStyles: Record<RequestStatus, string> = {
  [RequestStatus.Pending]: 'bg-amber-100 text-amber-800',
  [RequestStatus.Approved]: 'bg-primary/10 text-primary',
  [RequestStatus.Rejected]: 'bg-muted text-muted-foreground',
};

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminRequestsPage() {
  const { data: requests = [], isLoading, error } = useBusinessRequests();
  const mutation = useUpdateRequestStatus();

  const pendingCount = requests.filter((r) => r.status === RequestStatus.Pending).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Business request queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and approve businesses applying to Expade.</p>
        </div>
        {!isLoading && pendingCount > 0 && (
          <Badge className="bg-amber-100 text-amber-800">{pendingCount} pending</Badge>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm font-medium text-destructive">
                    Error loading requests.
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                        <Inbox className="size-6" />
                      </span>
                      <p className="font-bold text-foreground">No requests yet</p>
                      <p className="text-sm text-muted-foreground">New business applications will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{request.name}</p>
                      <p className="max-w-xs truncate text-xs text-muted-foreground">{request.address}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{request.categoryName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{request.phone}</td>
                    <td className="px-6 py-4">
                      <Badge className={cn('capitalize', statusStyles[request.status])}>{request.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(request.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === RequestStatus.Pending ? (
                          <>
                            <Button
                              size="sm"
                              className="h-8"
                              disabled={mutation.isPending}
                              onClick={() => mutation.mutate({ id: request.id, status: RequestStatus.Approved })}
                            >
                              <Check className="size-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              disabled={mutation.isPending}
                              onClick={() => mutation.mutate({ id: request.id, status: RequestStatus.Rejected })}
                            >
                              <X className="size-4" /> Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
