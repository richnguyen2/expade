import { apiClient } from './api-client';
import type { Category } from '@/types';

export const categoryService = {
  getAll: (token: string | null) => apiClient.get<Category[]>('/categories', token),
};
