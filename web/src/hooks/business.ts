import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { businessService } from '@/services/businessServices';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  BusinessHoursInput,
  CreateBlockedTimeRequest,
  CreateBusinessFromRequest,
  CreateServiceRequest,
  UpdateBusinessRequest,
  UpdateServiceRequest,
} from '@/types';

/** All businesses for the discovery feed. */
export function useBusinesses() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.businesses,
    queryFn: async () => businessService.getAll(await getToken()),
  });
}

/** A single business with its services and workers. */
export function useBusiness(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.business(id),
    queryFn: async () => businessService.getById(id, await getToken()),
    enabled: Boolean(id),
  });
}

/** Businesses the current user owns or works at. */
export function useMyBusinesses() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.myBusinesses,
    queryFn: async () => businessService.getMyBusinesses(await getToken()),
  });
}

/** Update a business's editable details (phone, description). */
export function useUpdateBusiness(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBusinessRequest) =>
      businessService.updateBusiness(id, data, await getToken()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business(id) }),
  });
}

/** Permanently delete a business and everything tied to it (Manager only). */
export function useDeleteBusiness(id: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => businessService.deleteBusiness(id, await getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBusinesses });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.business(id) });
    },
  });
}

/** Onboard a business from an approved request. */
export function useCreateBusinessFromRequest() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (data: CreateBusinessFromRequest) =>
      businessService.createBusinessFromRequest(data, await getToken({ skipCache: true })),
  });
}

/** Add / update / delete services for a business; each invalidates the business. */
export function useServiceMutations(businessId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business(businessId) });

  const addService = useMutation({
    mutationFn: async (data: CreateServiceRequest) =>
      businessService.addService(businessId, data, await getToken()),
    onSuccess: invalidate,
  });

  const updateService = useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: UpdateServiceRequest }) =>
      businessService.updateService(businessId, serviceId, data, await getToken()),
    onSuccess: invalidate,
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) =>
      businessService.deleteService(businessId, serviceId, await getToken()),
    onSuccess: invalidate,
  });

  return { addService, updateService, deleteService };
}

/** Weekly operating hours for a business. */
export function useBusinessHours(businessId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.businessHours(businessId),
    queryFn: async () => businessService.getHours(businessId, await getToken()),
    enabled: Boolean(businessId),
  });
}

/** Replace all 7 days of business hours (Manager only). */
export function useUpdateBusinessHours(businessId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (hours: BusinessHoursInput[]) =>
      businessService.updateHours(businessId, hours, await getToken()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.businessHours(businessId) }),
  });
}

/** Available booking slots for a service on a specific date. */
export function useAvailability(businessId: string, serviceId: string, date: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.availability(businessId, serviceId, date),
    queryFn: async () =>
      businessService.getAvailability(businessId, serviceId, date, await getToken()),
    enabled: Boolean(businessId && serviceId && date),
  });
}

/** Manual blocked times for a business (owner schedule). */
export function useBlockedTimes(businessId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.blockedTimes(businessId),
    queryFn: async () => businessService.getBlockedTimes(businessId, await getToken()),
    enabled: Boolean(businessId),
  });
}

/** Create a blocked time; invalidates the business's block list. */
export function useCreateBlockedTime(businessId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBlockedTimeRequest) =>
      businessService.createBlockedTime(businessId, data, await getToken()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockedTimes(businessId) }),
  });
}

/** Delete a blocked time; invalidates the business's block list. */
export function useDeleteBlockedTime(businessId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) =>
      businessService.deleteBlockedTime(businessId, blockId, await getToken()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blockedTimes(businessId) }),
  });
}
