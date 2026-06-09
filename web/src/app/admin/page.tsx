'use client';
import { businessRequestService } from '@/services/businessRequestService';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const [requestStatus, setRequestStatus] = useState(0);

    const { data, isPending, error } = useQuery({
        queryKey: ['business-requests', requestStatus], 
        queryFn: async () => {
            const currentToken = await getToken();
            return businessRequestService.getAll(currentToken, requestStatus);
    }});

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            const currentToken = await getToken();
            return businessRequestService.approve(id, currentToken);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-requests'], exact: false })
    });

    if (isPending) return <div>Loading...</div>;
    if (error) return <div>Error loading requests.</div>;

    return (
    <div className="p-10">
        <h1 className="text-2xl font-bold">Requests</h1>
        {data.map((req: any) => (
        <div key={req.id} className="border p-4 my-2 flex justify-between">
            <span>{req.name}</span>
            <button 
            onClick={() => mutation.mutate(req.id)} 
            className="bg-green-600 text-white px-4 py-2 rounded"
            >
            Approve
            </button>
        </div>
        ))}
    </div>
    );
    }