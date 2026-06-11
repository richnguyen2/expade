'use client';

import { UserButton, useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { MapPin, Search, Bell, ClipboardList } from 'lucide-react'; // Assuming you use lucide-react for icons

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'Admin';

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
      
      {/* LEFT: Branding */}
      <div className="flex items-center">
        <Link href={isSignedIn ? "/home" : "/"} className="flex items-center gap-2">
          {/* Mock Logo Icon */}
          <div className="bg-[#708238] text-white p-1 rounded">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v3H4V4zm0 6h16v3H4v-3zm0 6h16v3H4v-3z"/></svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#708238]">EXPADE</span>
        </Link>
      </div>

      {/* MIDDLE: Location & Search */}
      <div className="flex-1 flex items-center justify-center max-w-3xl gap-4 px-8">
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="truncate max-w-[150px]">683 McConnell Run Crossing</span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search Service Providers" 
            className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 pl-12 pr-4 py-2.5 rounded-full border-none focus:ring-2 focus:ring-[#708238] focus:bg-white focus:outline-none text-sm transition"
          />
        </div>
      </div>

      {/* RIGHT: Actions & Auth */}
      <div className="flex items-center gap-6">
        {/* Marketplace Actions (Visible if logged in or not, adjust as needed) */}
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition">
          <ClipboardList className="w-4 h-4 text-gray-700" />
          <span>Requests</span>
          {/* Mock notification bubble */}
          <span className="absolute top-3 right-[145px] bg-[#708238] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            3
          </span>
        </button>

        {isLoaded && isSignedIn ? (
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-800 transition">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* The Clerk User Profile overrides our mock profile circle */}
            <div className="border-2 border-gray-100 rounded-full hover:border-[#708238] transition p-0.5">
              <UserButton/> 
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-gray-600 hover:text-[#708238]">Log In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-sm font-semibold bg-[#708238] text-white px-4 py-2 rounded-full hover:bg-[#5b6b2e] transition">Sign Up</button>
            </SignUpButton>
          </div>
        )}
      </div>

    </header>
  );
}