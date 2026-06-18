'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
  Home,
  Building2,
  PlusCircle,
  CalendarDays,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

const primaryNav: NavItem[] = [
  { name: 'Discover', href: '/home', icon: Home },
  { name: 'My Businesses', href: '/my-businesses', icon: Building2 },
  { name: 'Appointments', href: '/appointments', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'Admin';

  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' : pathname.startsWith(href);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {primaryNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
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

        {isAdmin && (
          <Link
            href="/admin/requests"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <ShieldCheck className="size-5" />
            Admin
          </Link>
        )}
      </nav>

      {/* Bottom CTA */}
      <div className="border-t border-border p-3">
        <Link
          href="/business-signup"
          className="flex items-center gap-3 rounded-xl bg-primary px-3 py-3 text-primary-foreground shadow-sm transition-colors hover:bg-[color-mix(in_oklch,var(--primary),black_8%)]"
        >
          <PlusCircle className="size-5 shrink-0" />
          <span className="flex flex-col text-left leading-tight">
            <span className="text-sm font-bold">List your business</span>
            <span className="text-xs text-primary-foreground/80">Start reaching customers</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
