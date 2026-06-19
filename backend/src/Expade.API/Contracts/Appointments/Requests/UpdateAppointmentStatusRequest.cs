using Expade.Core.Enums;

namespace Expade.API.Contracts.Appointments.Requests;

public record UpdateAppointmentStatusRequest(AppointmentStatus Status);
