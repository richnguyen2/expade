'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { businessService } from '@/services/businessServices';
import { MapPin, Phone, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Row() {
  const { getToken } = useAuth();

  // Fetch the data
  const { data: businesses, isPending, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const currentToken = await getToken();
      return businessService.getAll(currentToken);
    }
  });

  // Handle Loading, Error, and Empty States
  if (isPending) return <div className="text-center py-12 animate-pulse text-gray-500">Loading local options...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Failed to load the marketplace.</div>;
  if (!businesses || businesses.length === 0) return <div className="text-center py-12 text-gray-500">No businesses available yet. Check back soon!</div>;

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Destinations</h2>
        <button className="flex items-center gap-1 text-sm font-semibold text-[#708238] hover:underline">
          See All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Netflix / DoorDash style horizontal scroll container */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-2 snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {businesses.map((biz: any) => (
          <Link 
            href={`/businesses/${biz.id}`} 
            key={biz.id} 
            className="flex-none w-[280px] sm:w-[320px] bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 snap-start overflow-hidden group flex flex-col justify-between"
          >
            <div>
              {/* Dynamic Theme Banner / Image Area */}
              <div className="relative h-40 bg-[#708238]/10 text-[#708238] flex flex-col items-center justify-center font-bold text-4xl group-hover:bg-[#708238]/15 transition-colors">
                {/* Fallback avatar block */}
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm text-2xl text-[#708238]">
                  {biz.name.charAt(0)}
                </div>

                {/* Rating Badge (Styled like food/delivery apps) */}
                <span className="absolute bottom-3 right-3 bg-white text-gray-900 font-bold text-xs px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.8
                </span>
              </div>

              {/* Business Description block */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#708238] transition-colors line-clamp-1">
                  {biz.name}
                </h3>
                
                <p className="text-xs text-gray-500 font-medium tracking-tight uppercase">
                  {biz.categoryName || 'Local Partner'}
                </p>

                <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                  {biz.description || "No description provided yet."}
                </p>
              </div>
            </div>

            {/* Sticky contact details footer */}
            <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/50 mt-2 text-xs text-gray-500 space-y-1.5">
              <div className="flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{biz.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{biz.phone}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}