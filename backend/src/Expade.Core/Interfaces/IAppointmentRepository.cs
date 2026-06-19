using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(Guid id);

    /// <summary>The client's appointments (service + business + worker included), soonest first.</summary>
    Task<IEnumerable<Appointment>> GetByClientIdAsync(Guid clientId);

    /// <summary>A worker's appointments on a given UTC date — used for conflict checks (includes the service for duration).</summary>
    Task<IEnumerable<Appointment>> GetByWorkerAndDateAsync(Guid workerId, DateOnly date);

    Task AddAsync(Appointment appointment);
    Task UpdateAsync(Appointment appointment);
}
