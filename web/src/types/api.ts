// These interfaces mirror the backend API contracts exactly (Expade.API.Contracts).
// They describe the shapes that actually cross the wire — not the EF entity graph.

import { RequestStatus } from './enums';

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
}

export interface WorkerInput {
  email: string;
}

export interface CreateBusinessFromRequest {
  requestId: string;
  description: string;
  services: ServiceInput[];
  workers: WorkerInput[];
}
