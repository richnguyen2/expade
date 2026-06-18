'use client';

import { UserButton } from '@clerk/nextjs';
import { Search, Bell } from 'lucide-react';

export default function AdminNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 bg-primary px-5 text-primary-foreground sm:px-6">
      {/* Brand + admin badge */}
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-white/15">
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
            <rect x="3" y="4" width="18" height="3.2" rx="1.6" />
            <rect x="3" y="10.4" width="13" height="3.2" rx="1.6" />
            <rect x="3" y="16.8" width="18" height="3.2" rx="1.6" />
          </svg>
        </span>
        <span className="text-lg font-extrabold tracking-tight">Expade</span>
        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Search */}
      <div className="relative mx-auto w-full max-w-xl">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/60" />
        <input
          type="text"
          placeholder="Search business requests…"
          className="w-full rounded-xl border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/60 transition-colors focus:bg-white/20 focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-3">
        <button className="grid size-9 place-items-center rounded-xl transition-colors hover:bg-white/10" aria-label="Notifications">
          <Bell className="size-5" />
        </button>
        <div className="rounded-full ring-2 ring-white/20">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
