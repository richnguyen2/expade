'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { businessRequestService } from '@/services/businessRequestService';
import { Plus, Trash2, ShieldCheck, Briefcase, Users, FileText, Loader2 } from 'lucide-react';
import { businessService } from '@/services/businessServices';

interface OnboardPageProps {
    params: Promise<{ id: string }>;
}

export default function OnboardPage({ params }: OnboardPageProps) {
    const { id } = use(params);
    const { getToken } = useAuth();
    const router = useRouter();

    // Form states for the new items required
    const [description, setDescription] = useState('');
    const [services, setServices] = useState<{ name: string; description: string }[]>([{ name: '', description: '' }]);
    const [workers, setWorkers] = useState<{ email: string; role: string }[]>([]);

    // 1. Fetch & Verify Request Data
    const { data: requestData, isLoading, error } = useQuery({
        queryKey: ['onboarding-data', id],
        queryFn: async () => {
            const token = await getToken();
            return businessRequestService.getOnboardingData(id, token);
        },
        retry: false
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const currentToken = await getToken({ skipCache: true });
            return businessService.createBusinessFromRequest(data, currentToken);
        },
        onSuccess: () => {
            router.push('/home'); // Take them home to see their live listing!
        },
        onError: (err: any) => {
            alert(err.message);
        }
    });

    // Dynamic List Handlers: Services
    const addService = () => setServices([...services, { name: '', description: '' }]);
    const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
    const updateService = (index: number, field: 'name' | 'description', value: string) => {
        const updated = [...services];
        updated[index][field] = value;
        setServices(updated);
    };

    // Dynamic List Handlers: Workers
    const addWorker = () => setWorkers([...workers, { email: '', role: 'Staff' }]);
    const removeWorker = (index: number) => setWorkers(workers.filter((_, i) => i !== index));
    const updateWorker = (index: number, email: string) => {
        const updated = [...workers];
        updated[index].email = email;
        setWorkers(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            requestId: id,
            description,
            services,
            workers
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#708238]" />
                <p className="mt-4 text-gray-500 font-medium">Verifying authorization link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-red-100 text-center">
                    <div className="text-red-500 font-bold text-xl mb-2">Access Denied</div>
                    <p className="text-gray-600 text-sm">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                
                {/* Visual Header */}
                <div className="bg-[#708238] px-8 py-10 text-white flex items-center justify-between">
                    <div>
                        <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Step 2: Activation</span>
                        <h1 className="text-3xl font-extrabold tracking-tight mt-2">Launch Your Marketplace Profile</h1>
                        <p className="text-white/80 text-sm mt-1">Finish setting up details for <span className="underline decoration-white/40 font-bold">{requestData?.name}</span></p>
                    </div>
                    <ShieldCheck className="w-16 h-16 text-white/20 hidden sm:block shrink-0" />
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 divide-y divide-gray-100">
                    
                    {/* SECTION 1: Read Only Approved Information */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#708238]" /> Verified Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
                            <div><span className="font-semibold text-gray-400 block text-xs uppercase">Category</span> {requestData?.categoryName}</div>
                            <div><span className="font-semibold text-gray-400 block text-xs uppercase">Phone</span> {requestData?.phone}</div>
                            <div className="sm:col-span-2"><span className="font-semibold text-gray-400 block text-xs uppercase">Business Address</span> {requestData?.address}</div>
                        </div>
                    </div>

                    {/* SECTION 2: Business Description */}
                    <div className="pt-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[#708238]" /> Marketplace Profile Description
                        </h2>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tell clients about your business</label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Provide a thorough overview of your background, specialties, and hours of operations..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#708238]/30 focus:border-[#708238] transition-all text-gray-800"
                            />
                        </div>
                    </div>

                    {/* SECTION 3: Dynamic Services Section */}
                    <div className="pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-[#708238]" /> Offered Services
                            </h2>
                            <button type="button" onClick={addService} className="flex items-center gap-1.5 text-xs font-bold text-[#708238] hover:text-[#5b6b2e] bg-[#708238]/10 px-3 py-1.5 rounded-lg transition-colors">
                                <Plus className="w-4 h-4" /> Add Service
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {services.map((service, index) => (
                                <div key={index} className="flex gap-3 bg-gray-50/40 p-4 rounded-xl border border-gray-100 relative group">
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Service Name (e.g., Brake Pad Replacement)"
                                            value={service.name}
                                            onChange={(e) => updateService(index, 'name', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#708238]"
                                        />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Short service description or base pricing details"
                                            value={service.description}
                                            onChange={(e) => updateService(index, 'description', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#708238]"
                                        />
                                    </div>
                                    {services.length > 1 && (
                                        <button type="button" onClick={() => removeService(index)} className="text-gray-400 hover:text-red-500 self-center p-2 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 4: Add Team Members */}
                    <div className="pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#708238]" /> Team Members <span className="text-xs font-normal text-gray-400">(Optional)</span>
                            </h2>
                            <button type="button" onClick={addWorker} className="flex items-center gap-1.5 text-xs font-bold text-[#708238] hover:text-[#5b6b2e] bg-[#708238]/10 px-3 py-1.5 rounded-lg transition-colors">
                                <Plus className="w-4 h-4" /> Invite Worker
                            </button>
                        </div>

                        {workers.length === 0 ? (
                            <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl text-center">You will automatically be assigned as the Manager. Add staff accounts here if needed.</p>
                        ) : (
                            <div className="space-y-3">
                                {workers.map((worker, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <input
                                            type="email"
                                            required
                                            placeholder="staffmember@email.com"
                                            value={worker.email}
                                            onChange={(e) => updateWorker(index, e.target.value)}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#708238]"
                                        />
                                        <span className="text-xs px-3 py-2 bg-gray-100 text-gray-500 font-medium rounded-lg border border-gray-200">Staff</span>
                                        <button type="button" onClick={() => removeWorker(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-[#708238] hover:bg-[#5b6b2e] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-base"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating Business Environment...</span>
                                </>
                            ) : (
                                <span>Publish Live Environment</span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}