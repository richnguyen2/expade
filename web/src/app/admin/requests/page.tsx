'use client';

import { RequestStatus } from "@/types";
import { useBusinessRequests, useUpdateRequestStatus } from "@/hooks";

export default function AdminRequestsPage() {
    const { data: requests = [], isLoading, error } = useBusinessRequests();
    const mutation = useUpdateRequestStatus();

    if (error) return <div>Error loading requests.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Section Headers & Quick Stats pills */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Business Request Queue</h2>
            </div>

            {/* Interactive Data Grid */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Request ID</th>
                            <th className="px-6 py-4">Business Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Contact Person</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">Loading incoming requests...</td>
                            </tr>
                        ) : (
                            requests.map((request, idx) => (
                                <tr key={`${request.id}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-600">{request.id}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">{request.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{request.categoryName}</td>
                                    <td className="px-6 py-4 text-gray-600">{request.address}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${request.status === RequestStatus.Pending ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                                request.status === RequestStatus.Approved ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                                                    "bg-gray-100 text-gray-800 border border-gray-200"
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{request.createdAt}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2 text-xs font-semibold">
                                            <button className="px-3 py-1.5 bg-[#708238] text-white rounded-md hover:bg-[#5b6b2e] transition-colors shadow-sm">
                                                View
                                            </button>

                                            {request.status === RequestStatus.Pending && (
                                                <>
                                                    <button
                                                        onClick={() => mutation.mutate({ id: request.id, status: RequestStatus.Approved })}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => mutation.mutate({ id: request.id, status: RequestStatus.Rejected })}
                                                        className="px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}