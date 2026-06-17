import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { X, Tag, AlignLeft, DollarSign, Loader2, Clock } from 'lucide-react';
import { businessService } from '@/services/businessServices';
import { CreateServiceRequest } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';

interface AddServiceModalProps {
    businessId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddServiceModal({ businessId, isOpen, onClose }: AddServiceModalProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const addServiceMutation = useMutation({
        mutationFn: async (newService: CreateServiceRequest) => {
            const token = await getToken();
            return businessService.addService(businessId, newService, token);
            
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business(businessId) });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        addServiceMutation.mutate({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')),
            durationInMinutes: Number(formData.get('durationInMinutes')) || 0,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all sm:scale-100 scale-95">
                
                {/* Header */}
                <div className="bg-gray-50/80 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Add New Service</h3>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Service Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                id="name"
                                name="name" 
                                required 
                                placeholder="e.g., Deep Cleaning"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Price Input */}
                    <div>
                        <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Price
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="number" 
                                id="price"
                                name="price" 
                                min="0"
                                step="0.01"
                                required 
                                placeholder="0.00"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="durationInMinutes" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Duration
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="number" 
                                id="durationInMinutes"
                                name="durationInMinutes" 
                                min="0"
                                step="1"
                                required 
                                placeholder="0"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Description
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <AlignLeft className="h-4 w-4 text-gray-400" />
                            </div>
                            <textarea 
                                id="description"
                                name="description" 
                                rows={3} 
                                placeholder="Briefly describe what this service includes..."
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all sm:text-sm resize-none"
                            />
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3 justify-end">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={addServiceMutation.isPending} 
                            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                        >
                            {addServiceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {addServiceMutation.isPending ? 'Saving...' : 'Save Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}