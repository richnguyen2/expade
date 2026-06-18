import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryServices';
import { QUERY_KEYS } from '@/lib/constants';

/** Active categories. Public endpoint — no token required. */
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => categoryService.getAll(null),
  });
}
