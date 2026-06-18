'use client';

import { useMyBusinesses } from "@/hooks";
import { Briefcase, Building2, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function MyBusinessesPage() {
    const { data: businesses = [], isLoading, error } = useMyBusinesses();

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading your dashboard...</div>;
    if (error) return <div className="p-10 text-center text-red-500">Error loading your businesses.</div>;

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">My Businesses</h1>
                <p className="text-gray-600">Manage the businesses you own or work for.</p>
            </header>

            {businesses.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No businesses yet</h3>
                    <p className="text-gray-500">You aren't associated with any business yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {businesses.map((biz) => (
                        <Link 
                            key={biz.id} 
                            href={`/my-businesses/dashboard/${biz.id}`}
                            className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {biz.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{biz.categoryName}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-1">
                                    <UserCog className="w-3 h-3" />
                                    {biz.role}
                                </span>
                                <div className="text-gray-400">→</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}