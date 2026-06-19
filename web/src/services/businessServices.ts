import { apiClient } from './api-client';
import type {
  BusinessResponse,
  BusinessListItemResponse,
  BusinessSummaryResponse,
  BusinessHoursInput,
  BusinessHoursResponse,
  CreateBusinessFromRequest,
  CreateServiceRequest,
  ServiceResponse,
  UpdateBusinessRequest,
  UpdateServiceRequest,
} from '@/types';

export const businessService = {
  getAll: (token: string | null) =>
    apiClient.get<BusinessListItemResponse[]>('/businesses', token),

  getById: (id: string, token: string | null) =>
    apiClient.get<BusinessResponse>(`/businesses/${id}`, token),

  getMyBusinesses: (token: string | null) =>
    apiClient.get<BusinessSummaryResponse[]>('/businesses/my-businesses', token),

  createBusinessFromRequest: (data: CreateBusinessFromRequest, token: string | null) =>
    apiClient.post<BusinessResponse>('/businesses/create-from-request', data, token),

  updateBusiness: (id: string, data: UpdateBusinessRequest, token: string | null) =>
    apiClient.patch<void>(`/businesses/${id}`, data, token),

  addService: (id: string, data: CreateServiceRequest, token: string | null) =>
    apiClient.post<ServiceResponse>(`/businesses/${id}/services`, data, token),

  updateService: (id: string, serviceId: string, data: UpdateServiceRequest, token: string | null) =>
    apiClient.put<ServiceResponse>(`/businesses/${id}/services/${serviceId}`, data, token),

  deleteService: (id: string, serviceId: string, token: string | null) =>
    apiClient.delete(`/businesses/${id}/services/${serviceId}`, token),

  getHours: (id: string, token: string | null) =>
    apiClient.get<BusinessHoursResponse[]>(`/businesses/${id}/hours`, token),

  updateHours: (id: string, hours: BusinessHoursInput[], token: string | null) =>
    apiClient.put<void>(`/businesses/${id}/hours`, { hours }, token),

  getAvailability: (businessId: string, serviceId: string, date: string, token: string | null) =>
    apiClient.get<string[]>(
      `/businesses/${businessId}/availability?serviceId=${serviceId}&date=${date}`,
      token,
    ),
};
