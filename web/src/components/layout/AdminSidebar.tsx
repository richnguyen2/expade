'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [{ name: 'Business requests', href: '/admin/requests', icon: ClipboardList }];

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-background md:flex">
      <nav className="space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className={cn('size-5', active ? 'text-primary' : 'text-muted-foreground')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/home"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
          Back to Expade
        </Link>
      </div>
    </aside>
  );
}
