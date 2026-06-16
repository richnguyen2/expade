'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/businessServices';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Clock, DollarSign, Star } from 'lucide-react';
import { Business } from '@/types/models';
import { use } from 'react';

interface BusinessPageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessDetailsPage({ params }: BusinessPageProps) {
  const { id } = use(params);
  const { getToken } = useAuth();

  const { data: business, isPending, error } = useQuery<Business>({
    queryKey: ['business', id],
    queryFn: async () => {
      const token = await getToken();
      return businessService.getById(id, token);
    },
  });

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
        <div className="text-center text-gray-500">Loading business details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">Unable to load business.</p>
          <p className="mt-3 text-sm text-gray-600">Please try again or return to the marketplace.</p>
          <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-[#708238] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b6b2e] transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16">
        <div className="text-center text-gray-500">Business not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#708238] px-6 py-10 sm:px-10 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#d6e4be]">{business.category?.name || 'Local Partner'}</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{business.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#f3f7e3]">{business.description || 'No description available for this business yet.'}</p>
              </div>
              <div className="rounded-3xl bg-white/10 px-5 py-4 text-sm text-white ring-1 ring-white/15">
                <div className="flex items-center gap-2 font-semibold">
                  <Star className="h-4 w-4 text-amber-300" />
                  4.8
                </div>
                <p className="mt-1 text-sm text-[#edf5d8]">Popular local provider</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-gray-100 bg-white p-6 sm:grid-cols-3 sm:gap-6">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Location</p>
              <p className="mt-3 text-sm text-gray-700">{business.address}</p>
              <div className="mt-3 flex items-center gap-2 text-gray-500">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Verified address</span>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Contact</p>
              <p className="mt-3 text-sm text-gray-700">{business.phone}</p>
              <div className="mt-3 flex items-center gap-2 text-gray-500">
                <Phone className="h-4 w-4" />
                <span className="text-xs">Call to book</span>
              </div>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Service count</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">{business.services?.length ?? 0}</p>
              <p className="mt-2 text-xs text-gray-500">Services available now</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Available Services</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Book a service</h2>
              </div>
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#708238] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5b6b2e] transition-colors">
                Back to marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 px-4 py-5 sm:px-6">
            {business.services && business.services.length > 0 ? (
              business.services.map((service) => (
                <div key={service.id} className="rounded-3xl border border-gray-100 p-5 sm:p-6 hover:border-[#708238] transition-colors">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#708238] uppercase tracking-[0.20em]">{service.name}</p>
                      <p className="mt-2 text-sm text-gray-600">{service.description || 'No description provided for this service.'}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-right sm:items-end">
                      <p className="text-lg font-bold text-gray-900">${service.price}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {service.durationInMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-gray-400">Tap to reserve this service in the upcoming appointment flow.</div>
                    <Link
                      href={`/appointments/${service.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-[#708238] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b6b2e] transition-colors"
                    >
                      Book appointment
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                No services listed for this business yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
