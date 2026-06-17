import { apiClient } from './api-client';
import type {
  BusinessRequestResponse,
  BusinessRequestOnboardResponse,
  CreateBusinessRequestRequest,
  RequestStatus,
} from '@/types';

export const businessRequestService = {
  getAll: (token: string | null) =>
    apiClient.get<BusinessRequestResponse[]>('/business-requests', token),

  submit: (data: CreateBusinessRequestRequest, token: string | null) =>
    apiClient.post<BusinessRequestResponse>('/business-requests', data, token),

  updateStatus: (id: string, status: RequestStatus, token: string | null) =>
    apiClient.patch<void>(`/business-requests/${id}/status`, { status }, token),

  getOnboardingData: (id: string, token: string | null) =>
    apiClient.get<BusinessRequestOnboardResponse>(`/business-requests/${id}/onboarding-data`, token),
};
