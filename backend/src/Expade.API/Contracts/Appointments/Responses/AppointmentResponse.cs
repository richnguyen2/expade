namespace Expade.API.Contracts.Appointments.Responses;

public record AppointmentResponse(
    Guid Id,
    Guid BusinessId,
    string BusinessName,
    string ServiceName,
    decimal Price,
    int DurationInMinutes,
    string WorkerName,
    DateTimeOffset StartDateTime,
    string TimeZoneId,
    string Status
);
