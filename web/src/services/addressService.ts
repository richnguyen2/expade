import { apiClient } from './api-client';
import type { AddressSuggestionResponse } from '@/types';

export const addressService = {
  search: (query: string, token: string | null) =>
    apiClient.get<AddressSuggestionResponse[]>(
      `/addresses/search?q=${encodeURIComponent(query)}`,
      token,
    ),
};
