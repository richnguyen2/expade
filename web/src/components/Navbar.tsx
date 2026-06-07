'use client';
import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <nav className="flex justify-between items-center p-6 border-b">
      <Link href="/" className="font-bold text-xl">Expade</Link>
      
      <div className="flex gap-4 items-center">
        <Link href="/business-signup" className="text-sm">Business</Link>

        {isLoaded && isSignedIn ? (
          <>
            <span className="text-sm">Hello, {user.firstName || user.username}!</span>
            <UserButton /> {/* This automatically handles logout */}
          </>
        ) : (
          <>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </>
        )}
      </div>
    </nav>
  );
}