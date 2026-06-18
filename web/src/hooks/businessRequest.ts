import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { businessRequestService } from '@/services/businessRequestService';
import { QUERY_KEYS } from '@/lib/constants';
import type { BusinessRequestResponse, CreateBusinessRequestRequest, RequestStatus } from '@/types';

/** All business requests (admin queue). */
export function useBusinessRequests() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.businessRequests,
    queryFn: async () => businessRequestService.getAll(await getToken()),
  });
}

/** Onboarding data for an approved request (guards ownership + status server-side). */
export function useOnboardingData(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.onboardingData(id),
    queryFn: async () => businessRequestService.getOnboardingData(id, await getToken()),
    retry: false,
  });
}

/** Submit a new business request. */
export function useSubmitBusinessRequest() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBusinessRequestRequest) =>
      businessRequestService.submit(data, await getToken({ skipCache: true })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.businessRequests }),
  });
}

/** Approve / reject a request, with optimistic update + rollback. */
export function useUpdateRequestStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) =>
      businessRequestService.updateStatus(id, status, await getToken()),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.businessRequests });
      const previous = queryClient.getQueryData<BusinessRequestResponse[]>(QUERY_KEYS.businessRequests);
      queryClient.setQueryData(QUERY_KEYS.businessRequests, (old: BusinessRequestResponse[] = []) =>
        old.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(QUERY_KEYS.businessRequests, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.businessRequests }),
  });
}
