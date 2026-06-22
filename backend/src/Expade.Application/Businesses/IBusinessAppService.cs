using Expade.Core.Entities;

namespace Expade.Application.Businesses;

/* Commands mapped from API contracts by the endpoints (Application can't reference API contracts). */

public record ServiceItem(string Name, string Description, decimal Price, int DurationInMinutes);
public record WorkerItem(string Email);
public record HoursItem(int DayOfWeek, bool IsOpen, string Open, string Close);

public record CreateBusinessCommand(
    Guid RequestId,
    string Description,
    IReadOnlyList<ServiceItem> Services,
    IReadOnlyList<WorkerItem> Workers,
    IReadOnlyList<HoursItem> Hours);

public record ServiceCommand(string Name, string Description, decimal Price, int DurationInMinutes);

public interface IBusinessAppService
{
    Task<IEnumerable<Business>> GetAllAsync();
    Task<Business> GetByIdAsync(Guid id);
    Task<(Guid UserId, IEnumerable<Business> Businesses)> GetMyBusinessesAsync(string clerkId);
    Task UpdateAsync(Guid id, string clerkId, string phone, string description);
    Task<Business> CreateFromRequestAsync(string clerkId, CreateBusinessCommand command);

    Task<Service> AddServiceAsync(Guid businessId, string clerkId, ServiceCommand command);
    Task<Service> UpdateServiceAsync(Guid businessId, Guid serviceId, string clerkId, ServiceCommand command);
    Task DeleteServiceAsync(Guid businessId, Guid serviceId, string clerkId);

    Task<IEnumerable<BusinessHours>> GetHoursAsync(Guid businessId);
    Task UpdateHoursAsync(Guid businessId, string clerkId, IReadOnlyList<HoursItem> hours);

    Task<IReadOnlyList<DateTimeOffset>> GetAvailabilityAsync(Guid businessId, Guid serviceId, DateOnly date);
    Task<IEnumerable<Appointment>> GetBusinessAppointmentsAsync(Guid businessId, string clerkId);
}
