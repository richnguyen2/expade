'use client';

import { UserButton } from '@clerk/nextjs';
import { Search, Bell } from 'lucide-react';

export default function AdminNavbar() {
  return (
    <header className="h-16 bg-[#708238] flex items-center justify-between px-8 shadow-md shrink-0">
      
      {/* Expade Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-white font-serif text-2xl font-bold tracking-tight">Expade</span>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-xl mx-8 relative">
        <input 
          type="text" 
          placeholder="Search for a business request or category..." 
          className="w-full bg-white/10 text-white placeholder-white/60 pl-10 pr-4 py-2 rounded-full border border-white/20 focus:outline-none focus:bg-white/20 text-sm transition-colors"
        />
        <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-2.5" />
      </div>

      {/* Quick Profile context */}
      <div className="flex items-center space-x-6 text-white">
        <button className="flex items-center space-x-2 hover:text-white/80 transition-colors text-sm font-medium">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3 border-l border-white/20 pl-6">
          <span className="text-sm font-medium">Profile</span>
          <div className="border-2 border-white/20 rounded-full p-0.5 bg-white/10">
             <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}