// These interfaces mirror the backend API contracts exactly (Expade.API.Contracts).
// They describe the shapes that actually cross the wire — not the EF entity graph.

import { RequestStatus, AppointmentStatus } from './enums';

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* Responses                                                           */
/* ------------------------------------------------------------------ */

export interface ServiceResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
}

export interface WorkerResponse {
  id: string;
  email: string;
  jobTitle: string;
  /** Backend serializes WorkerRole as a string. */
  role: string;
}

/** GET /api/businesses/{id} */
export interface BusinessResponse {
  id: string;
  name: string;
  description: string;
  phone: string;
  address: string;
  categoryName: string;
  /** IANA timezone (e.g. "America/Chicago"). Times are displayed in this zone, not the viewer's. */
  timeZoneId: string;
  services: ServiceResponse[];
  workers: WorkerResponse[];
}

/** GET /api/businesses — public discovery card */
export interface BusinessListItemResponse {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  address: string;
  phone: string;
}

/** GET /api/businesses/my-businesses */
export interface BusinessSummaryResponse {
  id: string;
  name: string;
  categoryName: string;
  /** The requesting user's worker role at this business. */
  role: string;
}

/** GET /api/business-requests (admin) and POST /api/business-requests */
export interface BusinessRequestResponse {
  id: string;
  name: string;
  phone: string;
  address: string;
  categoryName: string;
  status: RequestStatus;
  createdAt: string;
}

/** GET /api/business-requests/{id}/onboarding-data */
export interface BusinessRequestOnboardResponse {
  id: string;
  name: string;
  phone: string;
  address: string;
  categoryId: string;
  categoryName: string;
}

/* ------------------------------------------------------------------ */
/* Request bodies                                                      */
/* ------------------------------------------------------------------ */

export interface CreateBusinessRequestRequest {
  name: string;
  phone: string;
  categoryId: string;
  address: string;
}

export interface UpdateBusinessRequest {
  phone: string;
  description: string;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
}

export interface UpdateServiceRequest {
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
}

export interface ServiceInput {
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
}

export interface WorkerInput {
  email: string;
}

/** One day of weekly hours. open/close are "HH:mm" (24h); dayOfWeek 0=Sunday..6=Saturday. */
export interface BusinessHoursInput {
  dayOfWeek: number;
  isOpen: boolean;
  open: string;
  close: string;
}

export type BusinessHoursResponse = BusinessHoursInput;

export interface CreateBusinessFromRequest {
  requestId: string;
  description: string;
  services: ServiceInput[];
  workers: WorkerInput[];
  hours: BusinessHoursInput[];
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

export interface AppointmentResponse {
  id: string;
  businessId: string;
  businessName: string;
  serviceName: string;
  price: number;
  durationInMinutes: number;
  workerName: string;
  clientName: string;
  startDateTime: string;
  /** IANA timezone of the business; format the time in this zone, not the viewer's. */
  timeZoneId: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentRequest {
  serviceId: string;
  startDateTime: string;
}

/* ------------------------------------------------------------------ */
/* Blocked times                                                       */
/* ------------------------------------------------------------------ */

export interface BlockedTimeResponse {
  id: string;
  startDateTime: string;
  endDateTime: string;
  reason: string | null;
}

/** Date + wall-clock "HH:mm" times; interpreted in the business's timezone server-side. */
export interface CreateBlockedTimeRequest {
  date: string;
  start: string;
  end: string;
  reason?: string;
}

/* ------------------------------------------------------------------ */
/* Address autocomplete                                                */
/* ------------------------------------------------------------------ */

/** GET /api/addresses/search — a validated, geocodable address suggestion. */
export interface AddressSuggestionResponse {
  formattedAddress: string;
  lat: number;
  lon: number;
  timeZoneId: string | null;
}
