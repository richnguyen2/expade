'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
    BarChart3, CalendarDays, Settings, Users, MousePointerClick,
    TrendingUp, Lock, CheckCircle2, Loader2, List, Plus, Trash2, DollarSign, Pencil
} from 'lucide-react';
import { ServiceResponse } from '@/types';
import { useBusiness, useUpdateBusiness, useServiceMutations } from '@/hooks';
import AddServiceModal from '@/components/business/AddServiceModal';
import EditServiceModal from '@/components/business/EditServiceModal';

export default function BusinessDashboardPage() {
    const params = useParams();
    const businessId = params.id as string;

    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'services' | 'settings'>('overview');
    const [successMessage, setSuccessMessage] = useState('');
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceResponse | null>(null);

    // --- DATA ---
    const { data: business, isLoading } = useBusiness(businessId);
    const updateMutation = useUpdateBusiness(businessId);
    const { deleteService: deleteServiceMutation } = useServiceMutations(businessId);

    // --- HANDLERS ---
    const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateMutation.mutate(
            {
                phone: formData.get('phone') as string,
                description: formData.get('description') as string,
            },
            {
                onSuccess: () => {
                    setSuccessMessage('Settings saved successfully!');
                    setTimeout(() => setSuccessMessage(''), 3000);
                },
            },
        );
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
    if (!business) return <div className="p-10 text-center text-red-500">Business not found.</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{business.name} Dashboard</h1>
                <p className="text-gray-500">Manage your metrics, schedule, and business settings.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8 w-fit overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <BarChart3 className="w-4 h-4" /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'schedule' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <CalendarDays className="w-4 h-4" /> Schedule
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <List className="w-4 h-4" /> Services
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                    <Settings className="w-4 h-4" /> Settings
                </button>
            </div>

            {/* TAB CONTENT: OVERVIEW (Metrics) */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <CalendarDays className="w-5 h-5 text-indigo-500" /> Appointments
                            </div>
                            <div className="text-3xl font-bold text-gray-900">124</div>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% this week</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <MousePointerClick className="w-5 h-5 text-blue-500" /> Page Views
                            </div>
                            <div className="text-3xl font-bold text-gray-900">892</div>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5% this week</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 text-gray-500 mb-2">
                                <Users className="w-5 h-5 text-orange-500" /> Active Workers
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{business.workers?.length || 0}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SCHEDULE */}
            {activeTab === 'schedule' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Full Schedule Viewer</h3>
                        <p className="text-gray-500">Calendar integration goes here.</p>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SERVICES */}
            {activeTab === 'services' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Manage Services</h2>
                            <p className="text-sm text-gray-500 mt-1">Add, remove, and price the services you offer.</p>
                        </div>
                        <button 
                            onClick={() => setIsAddServiceModalOpen(true)}
                            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Service
                        </button>
                    </div>

                    <div className="p-6">
                        {!business.services || business.services.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No services yet</h3>
                                <p className="text-gray-500 mt-1">Create your first service to start booking appointments.</p>
                                <button 
                                    onClick={() => setIsAddServiceModalOpen(true)}
                                    className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
                                >
                                    + Create a service
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {business.services.map((service: ServiceResponse) => (
                                    <div key={service.id} className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md text-xs font-semibold">
                                                    <DollarSign className="w-3 h-3" /> {service.price?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm max-w-2xl">{service.description}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 pl-4 border-l border-gray-100 ml-4">
                                            <button 
                                                onClick={() => setEditingService(service)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Service"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    
                                                        deleteServiceMutation.mutate(service.id);
                                                    
                                                }}
                                                disabled={deleteServiceMutation.isPending}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete Service"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: SETTINGS */}
            {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
                            {successMessage && (
                                <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                    <CheckCircle2 className="w-4 h-4" /> {successMessage}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    Business Name <Lock className="w-3 h-3 text-gray-400"/>
                                </label>
                                <input type="text" disabled defaultValue={business.name} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-4 py-2 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    Category <Lock className="w-3 h-3 text-gray-400"/>
                                </label>
                                <input type="text" disabled defaultValue={business.categoryName} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-4 py-2 cursor-not-allowed" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    Address <Lock className="w-3 h-3 text-gray-400"/>
                                </label>
                                <input type="text" disabled defaultValue={business.address} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-4 py-2 cursor-not-allowed" />
                            </div>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="space-y-6 mt-8 pt-8 border-t border-gray-100">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    defaultValue={business.phone}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    defaultValue={business.description}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                                />
                            </div>

                            {updateMutation.isError && (
                                <p className="text-sm text-red-500">Failed to save changes. Please try again.</p>
                            )}

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={updateMutation.isPending}
                                    className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                                >
                                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALS */}
            <AddServiceModal
                businessId={businessId}
                isOpen={isAddServiceModalOpen}
                onClose={() => setIsAddServiceModalOpen(false)}
            />
            
            <EditServiceModal 
                businessId={businessId}
                service={editingService}
                isOpen={!!editingService}
                onClose={() => setEditingService(null)}
            />
        </div>
    );
}