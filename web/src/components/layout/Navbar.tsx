'use client';

import { Suspense } from 'react';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import LocationPicker from '@/components/layout/LocationPicker';
import SearchBar from '@/components/layout/SearchBar';
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
        <LocationPicker />

        <Suspense fallback={<div className="h-10 w-full max-w-xl rounded-xl border border-border bg-muted/60" />}>
          <SearchBar />
        </Suspense>
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
