'use client';
import { businessRequestService } from '@/services/businessRequestService';
import { BusinessRequest, RequestStatus } from '@/types/models';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminDashboard() {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
 
    const { data = [], isLoading, error } = useQuery<BusinessRequest[]>({
        queryKey: ['business-requests'],
        queryFn: async () => {
            const currentToken = await getToken();
            return businessRequestService.getAll(currentToken);
        }
    });

    const mutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
            const currentToken = await getToken();
            return businessRequestService.updateStatus(id, status, currentToken);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['business-requests'], exact: false })
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading requests.</div>;

    return (
    <div className="p-10">
        <h1 className="text-2xl font-bold">Requests</h1>
        {data.map((req) => (
        <div key={req.id} className="border p-4 my-2 flex justify-between">
            <span>{req.name}</span>
            <button 
            onClick={() => mutation.mutate({ id: req.id, status: RequestStatus.Approved })} 
            className="bg-green-600 text-white px-4 py-2 rounded"
            >
            Approve
            </button>
        </div>
        ))}
    </div>
  );
}