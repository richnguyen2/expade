import { apiClient } from './api-client';

export const businessRequestService = {
  getAll: (token: string | null, status?: number, ) => apiClient.get(status ? `/business-requests?status=${status}` : '/business-requests', token),
  submit: (data: any, token: string | null) => apiClient.post('/business-requests', data, token),
  approve: (id: string, token: string | null) => apiClient.patch(`/business-requests/${id}/status`, { status: 'Approved' }, token)
};