import { apiClient } from './api-client';
import { Business } from '@/types/models';

export const businessService = {
    getAll: (token: string | null): Promise<Business[]> => apiClient.get('/businesses', token),
    createBusinessFromRequest: (data: any, token: string | null) => apiClient.post('/businesses/create-from-request', data, token),
};