// String enums mirror the backend's JsonStringEnumConverter output.

export enum RequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum UserRole {
  User = 'User',
  Worker = 'Worker',
  BusinessOwner = 'BusinessOwner',
  Admin = 'Admin',
}

export enum WorkerRole {
  Manager = 'Manager',
  Employee = 'Employee',
}
