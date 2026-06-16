'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  Home, 
  CarFront, 
  Wrench, 
  Sparkles, 
  Scale, 
  GraduationCap, 
  PawPrint, 
  Plane, 
  HeartPulse, 
  Palette,
  Settings,
  Building2,
  PlusCircle,
  Calendar
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  
  // Check role from Clerk metadata
  const isAdmin = user?.publicMetadata?.role === 'Admin';

  // Navigation Links Data
  const navLinks = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Automotive', href: '/category/automotive', icon: CarFront },
    { name: 'Home Services', href: '/category/home-services', icon: Wrench },
    { name: 'Beauty & Wellness', href: '/category/beauty-wellness', icon: Sparkles },
    { name: 'Legal & Financial', href: '/category/legal-financial', icon: Scale },
    { name: 'Education', href: '/category/education', icon: GraduationCap },
    { name: 'Pet Services', href: '/category/pets', icon: PawPrint },
    { name: 'Travel', href: '/category/travel', icon: Plane },
    { name: 'Health & Fitness', href: '/category/health', icon: HeartPulse },
    { name: 'Creative Services', href: '/category/creative', icon: Palette },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden font-sans">
      
      {/* Scrollable Top Section: Categories */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#708238]/10 text-[#708238] font-bold' 
                  : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#708238]' : 'text-gray-500'}`} />
              <span className="text-sm">{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Static Bottom Section: Action Buttons */}
      <div className="p-3 bg-white border-t border-gray-100 space-y-2 pb-6">
        
        {/* Only show Admin Portal if the user has the Admin role */}
        {isAdmin && (
          <Link 
            href="/admin/requests"
            className="flex items-center gap-3 w-full px-3 py-2.5 bg-[#708238] text-white rounded-lg hover:bg-[#5b6b2e] transition-colors shadow-sm"
          >
            <Settings className="w-5 h-5 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold leading-tight">Admin Portal</span>
              <span className="text-[10px] text-white/80 leading-tight">For authorized access</span>
            </div>
          </Link>
        )}

        <Link 
          href="/my-businesses"
          className="flex items-center gap-3 w-full px-3 py-2.5 bg-[#708238] text-white rounded-lg hover:bg-[#5b6b2e] transition-colors shadow-sm"
        >
          <Building2 className="w-5 h-5 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold leading-tight">My Businesses</span>
            <span className="text-[10px] text-white/80 leading-tight">View owned/worked companies</span>
          </div>
        </Link>

        <Link 
          href="/business-signup"
          className="flex items-center gap-3 w-full px-3 py-2.5 bg-[#708238] text-white rounded-lg hover:bg-[#5b6b2e] transition-colors shadow-sm"
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">Request Business</span>
        </Link>

        <Link 
          href="/appointments"
          className="flex items-center gap-3 w-full px-3 py-2.5 bg-[#708238] text-white rounded-lg hover:bg-[#5b6b2e] transition-colors shadow-sm"
        >
          <Calendar className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">Appointments</span>
        </Link>

      </div>
    </aside>
  );
}