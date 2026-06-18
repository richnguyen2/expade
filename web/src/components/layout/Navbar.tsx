'use client';

import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { MapPin, Search, Bell, ChevronDown } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
      {/* Branding */}
      <Link href={isSignedIn ? '/home' : '/'} className="shrink-0" aria-label="Expade home">
        <Logo />
      </Link>

      {/* Location + Search */}
      <div className="flex flex-1 items-center justify-center gap-3">
        <button className="hidden items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:flex">
          <MapPin className="size-4 text-primary" />
          <span className="max-w-[160px] truncate">683 McConnell Run</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services, businesses…"
            className="w-full rounded-xl border border-border bg-muted/60 py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Actions / Auth */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isLoaded && isSignedIn ? (
          <>
            <button
              className="relative grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
            </button>
            <div className="rounded-full ring-2 ring-border transition-colors hover:ring-primary">
              <UserButton />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="ghost" className="h-10 px-4 text-sm font-semibold">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="h-10 rounded-xl px-5 text-sm font-semibold">Sign up</Button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}
