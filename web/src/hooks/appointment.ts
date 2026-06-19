import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { appointmentService } from '@/services/appointmentService';
import { QUERY_KEYS } from '@/lib/constants';
import { AppointmentStatus } from '@/types';
import type { CreateAppointmentRequest } from '@/types';

/** All appointments for the signed-in client. */
export function useMyAppointments() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.myAppointments,
    queryFn: async () => appointmentService.getMyAppointments(await getToken()),
  });
}

/** Book a new appointment (client). Invalidates the appointments list on success. */
export function useCreateAppointment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppointmentRequest) =>
      appointmentService.create(data, await getToken()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAppointments }),
  });
}

/** Cancel (client) or confirm/complete (staff) an appointment. */
export function useUpdateAppointmentStatus() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentService.updateStatus(id, status, await getToken()),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAppointments }),
  });
}
