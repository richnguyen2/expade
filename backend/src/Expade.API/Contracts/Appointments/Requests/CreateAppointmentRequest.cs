namespace Expade.API.Contracts.Appointments.Requests;

public record CreateAppointmentRequest(Guid ServiceId, DateTimeOffset StartDateTime);
