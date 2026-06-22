using Expade.Core.Entities;
using Expade.Core.Enums;

namespace Expade.Application.Appointments;

public interface IAppointmentAppService
{
    Task<Appointment> BookAsync(string clerkId, Guid serviceId, DateTimeOffset startDateTime);
    Task<IEnumerable<Appointment>> GetMyAsync(string clerkId);
    Task<Appointment> UpdateStatusAsync(Guid id, string clerkId, AppointmentStatus status);
}
