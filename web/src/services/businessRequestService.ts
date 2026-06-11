import { apiClient } from './api-client';
import { BusinessRequest, RequestStatus } from '@/types/models';

export const businessRequestService = {
  getAll: (token: string | null): Promise<BusinessRequest[]> => apiClient.get('/business-requests', token),
  
  submit: (data: any, token: string | null) => apiClient.post('/business-requests', data, token),

  updateStatus: (id: string, status: RequestStatus, token: string | null) => apiClient.patch(`/business-requests/${id}/status`, { status }, token),
  getOnboardingData: (id: string, token: string | null) => apiClient.get(`/business-requests/${id}/onboarding-data`, token),
};