import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { addressService } from '@/services/addressService';

/**
 * On-demand address search (autocomplete). Search-on-demand, not per-keystroke:
 * call `mutate(query)` when the user submits the search; read suggestions from `data`.
 */
export function useAddressSearch() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (query: string) => addressService.search(query, await getToken()),
  });
}
