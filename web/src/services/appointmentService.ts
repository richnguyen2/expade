import { apiClient } from './api-client';
import type { AppointmentResponse, CreateAppointmentRequest } from '@/types';
import { AppointmentStatus } from '@/types';

export const appointmentService = {
  getMyAppointments: (token: string | null) =>
    apiClient.get<AppointmentResponse[]>('/appointments/my', token),

  create: (data: CreateAppointmentRequest, token: string | null) =>
    apiClient.post<AppointmentResponse>('/appointments', data, token),

  updateStatus: (id: string, status: AppointmentStatus, token: string | null) =>
    apiClient.patch<AppointmentResponse>(`/appointments/${id}/status`, { status }, token),
};
