import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { businessService } from '@/services/businessServices';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  BusinessHoursInput,
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
