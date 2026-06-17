import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { X, Tag, AlignLeft, DollarSign, Clock, Loader2 } from 'lucide-react';
import { businessService } from '@/services/businessServices';
import { ServiceResponse, UpdateServiceRequest } from '@/types';
import { QUERY_KEYS } from '@/lib/constants';

interface EditServiceModalProps {
    businessId: string;
    service: ServiceResponse | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditServiceModal({ businessId, service, isOpen, onClose }: EditServiceModalProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    const editServiceMutation = useMutation({
        mutationFn: async (updatedService: UpdateServiceRequest) => {
            if (!service) throw new Error("No service selected");
            const token = await getToken();
            return businessService.updateService(businessId, service.id, updatedService, token);
            
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business(businessId) });
            onClose();
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        editServiceMutation.mutate({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: Number(formData.get('price')) || 0,
            durationInMinutes: Number(formData.get('durationInMinutes')) || 0,
        });
    };

    if (!isOpen || !service) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50/80 backdrop-blur border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Edit Service</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Service Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                id="edit-name"
                                name="name" 
                                required 
                                defaultValue={service.name}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-price" className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="number" 
                                id="edit-price"
                                name="price" 
                                min="0" step="0.01" required 
                                defaultValue={service.price}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="edit-duration" className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="number" 
                                id="edit-duration"
                                name="durationInMinutes" 
                                min="0" step="0.01" required 
                                defaultValue={service.durationInMinutes}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <AlignLeft className="h-4 w-4 text-gray-400" />
                            </div>
                            <textarea 
                                id="edit-description"
                                name="description" 
                                rows={3} 
                                defaultValue={service.description}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-black outline-none sm:text-sm resize-none"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-2 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl">
                            Cancel
                        </button>
                        <button type="submit" disabled={editServiceMutation.isPending} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300">
                            {editServiceMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editServiceMutation.isPending ? 'Updating...' : 'Update Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}