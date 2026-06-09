import { apiClient } from './api-client';

export const categoryService = {
  getAll: (token: string | null) => apiClient.get('/categories', token),
};