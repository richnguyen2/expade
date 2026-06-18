'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, useSubmitBusinessRequest } from '@/hooks';
import { Building2, Phone, MapPin, Layers, ArrowRight, Loader2 } from 'lucide-react';

export default function BusinessSignup() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', phone: '', categoryId: '', address: '' });

    const { data, isPending, error } = useCategories();
    const mutation = useSubmitBusinessRequest();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData, {
            onSuccess: () => router.push('/home'),
            onError: (err) => alert('Error: ' + err.message),
        });
    };

    return (
        <div className="flex items-center justify-center py-12 px-2 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                
                {/* Header Section */}
                <div className="bg-[#708238] px-8 py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 shadow-sm">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Register Your Business
                    </h1>
                    <p className="mt-2 text-white/80 text-sm font-medium">
                        Join Expade's premier marketplace and start reaching new clients today.
                    </p>
                </div>

                {/* Form Section */}
                <div className="px-8 py-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Business Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Business Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    placeholder="e.g. Main Street Auto Shop"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#708238]/30 focus:border-[#708238] transition-all text-gray-800 placeholder-gray-400"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#708238]/30 focus:border-[#708238] transition-all text-gray-800 placeholder-gray-400"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Service Category</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Layers className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    className={`w-full pl-12 pr-10 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#708238]/30 focus:border-[#708238] transition-all appearance-none ${
                                        formData.categoryId === '' ? 'text-gray-400' : 'text-gray-800'
                                    }`}
                                    value={formData.categoryId}
                                    required
                                    disabled={isPending || Boolean(error)}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="" disabled>
                                        {isPending ? 'Loading categories...' : error ? 'Unable to load categories' : 'Select a primary category'}
                                    </option>
                                    {data?.map((category) => (
                                        <option key={category.id} value={category.id} className="text-gray-800">
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom Dropdown Arrow */}
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Business Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    placeholder="123 Market St, City, State, ZIP"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#708238]/30 focus:border-[#708238] transition-all text-gray-800 placeholder-gray-400"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full flex items-center justify-center gap-2 bg-[#708238] hover:bg-[#5b6b2e] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Submitting Request...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit for Verification</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                Our team will review your submission within 24-48 hours.
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}