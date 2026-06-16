export enum RequestStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected'
}

export enum AppointmentStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
}

export enum UserRole {
    User = 'User',
    Worker = 'Worker',
    BusinessOwner = 'BusinessOwner',
    Admin = 'Admin'
}

export enum WorkerRole {
    Manager = 'Manager',
    Employee = 'Employee'
}

// Note: C# JSON serialization in ASP.NET Core can be configured to use string enums.
// These interfaces reflect the client-side shape returned by the API.

export interface Category {
    id: string;
    name: string;
    isActive: boolean;
}

export interface Business {
    id: string;
    name: string;
    description: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    categoryId: string;
    category?: Category;
    workers?: Worker[];
    services?: Service[];
}

export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    durationInMinutes: number;
    businessId: string;
    business?: Business;
    appointments?: Appointment[];
}

export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    externalId: string;
    role: UserRole;
    createdAt: string;
    workerProfiles?: Worker[];
    clientAppointments?: Appointment[];
}

export interface Worker {
    id: string;
    role: WorkerRole;
    userId: string;
    businessId: string;
    jobTitle: string;
    createdAt: string;
    user?: User;
    business?: Business;
    appointments?: Appointment[];
}

export interface Appointment {
    id: string;
    clientId: string;
    workerId: string;
    serviceId: string;
    startDateTime: string;
    status: AppointmentStatus;
    client?: User;
    worker?: Worker;
    service?: Service;
}

export interface BusinessRequest {
    id: string;
    userId: string;
    name: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    status: RequestStatus;
    createdAt: string;
    categoryId: string;
    user?: User;
    category?: Category;
}

export interface BusinessSummaryResponse {
    id: string;
    name: string;
    categoryName: string;
    role: string;
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