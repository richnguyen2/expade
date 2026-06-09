'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessRequestService } from '@/services/businessRequestService';
import { categoryService } from '@/services/categoryServices';
import { useAuth } from '@clerk/nextjs';

export default function BusinessSignup() {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', phone: '', categoryId: '', address: '' });
    
    const { data, isPending, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const currentToken = await getToken();
            return categoryService.getAll(currentToken);
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const currentToken = await getToken({ skipCache: true });
            return businessRequestService.submit(data, currentToken);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['business-requests'], exact: false });
            router.push('/home')
        },
        onError: (err) => {
            alert('Error: ' + err.message);
        }
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Register Your Business</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    placeholder="Business Name"
                    className="border p-2 rounded"
                    required
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                    placeholder="Phone Number"
                    className="border p-2 rounded"
                    required
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Category</span>
                    <select
                        className="border p-2 rounded"
                        value={formData.categoryId} // Bind to categoryId
                        required
                        disabled={isPending || Boolean(error)}
                        // Update categoryId in state on change
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                        <option value="" disabled>
                            {isPending ? 'Loading categories...' : error ? 'Unable to load categories' : 'Select a category'}
                        </option>

                        {data?.map((category: any) => {
                            // Handle both PascalCase (C#) and camelCase JSON keys safely
                            const name = category.name ?? category.Name;
                            const id = category.id ?? category.Id;

                            return (
                                <option key={id} value={id}> {/* The value MUST be the ID */}
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                </label>
                <input
                    placeholder="Address"
                    className="border p-2 rounded"
                    required
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}