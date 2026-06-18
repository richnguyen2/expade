import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Logo from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Categories', href: '#categories' },
  { label: 'For businesses', href: '#for-businesses' },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="Expade home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignInButton mode="modal">
            <Button variant="ghost" className="h-10 px-4 text-sm font-semibold">
              Log in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="h-10 rounded-xl px-5 text-sm font-semibold shadow-sm">
              Get started
            </Button>
          </SignUpButton>
        </div>
      </div>
    </header>
  );
}
