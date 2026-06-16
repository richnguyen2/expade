import { apiClient } from './api-client';
import { Business, BusinessSummaryResponse, CreateServiceRequest, UpdateBusinessRequest, UpdateServiceRequest } from '@/types/models';

export const businessService = {
    getAll: (token: string | null): Promise<Business[]> => apiClient.get('/businesses', token),
    getById: (id: string, token: string | null): Promise<Business> => apiClient.get(`/businesses/${id}`, token),
    getMyBusinesses: (token: string | null): Promise<BusinessSummaryResponse[]> => apiClient.get('/businesses/my-businesses', token),
    createBusinessFromRequest: (data: any, token: string | null) => apiClient.post('/businesses/create-from-request', data, token),
    updateBusiness: (id: string, data: UpdateBusinessRequest, token: string | null) => apiClient.patch(`/businesses/${id}`, data, token),
    addService: (id: string, data: CreateServiceRequest, token: string | null) => apiClient.post(`/businesses/${id}/services`, data, token),
    updateService: (id: string, serviceId: string, data: UpdateServiceRequest, token: string | null) => apiClient.put(`/businesses/${id}/services/${serviceId}`, data, token),
    deleteService: (id: string, serviceId: string, token: string | null): Promise<Business> => apiClient.delete(`/businesses/${id}/services/${serviceId}`, token),
};