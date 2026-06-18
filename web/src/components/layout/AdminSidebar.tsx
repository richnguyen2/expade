'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#708238] text-white flex flex-col justify-between p-4 shadow-lg shrink-0">
      <div>
        {/* Admin Panel Branding */}
        <div className="mb-8 pt-2 px-2">
          <h1 className="text-2xl font-bold tracking-wide uppercase">Admin Panel</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-3">
          {/* Dashboard (Currently just a placeholder link) */}
          <Link 
            href="/admin/requests" 
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
              pathname === '/admin/dashboard' 
                ? 'bg-white text-[#708238] font-semibold shadow-sm' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* Business Requests */}
          <Link 
            href="/admin/requests" 
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
              pathname.includes('/admin/requests')
                ? 'bg-white text-[#708238] font-semibold shadow-sm' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>Business Requests</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Static Go Back Home Button */}
      <div className="pt-4 border-t border-white/20">
        <Link 
          href="/home" 
          className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-white text-[#708238] font-bold rounded-lg hover:bg-gray-100 transition-all shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back To Home</span>
        </Link>
      </div>
    </aside>
  );
}