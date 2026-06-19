using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(Guid id);
    /// <summary>The business that owns a given service, with workers + hours + services (for booking).</summary>
    Task<Business?> GetByServiceIdAsync(Guid serviceId);
    Task<IEnumerable<Business>> GetAllAsync();
    Task<IEnumerable<Business>> GetBusinessesByUserIdAsync(Guid userId);
    Task AddAsync(Business business);
    Task UpdateAsync(Business business);
    Task AddServiceAsync(Service service);
    Task SaveChangesAsync();
    void RemoveService(Service service);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsByRequestIdAsync(Guid requestId);

    // Weekly operating hours
    Task<IEnumerable<BusinessHours>> GetHoursAsync(Guid businessId);
    Task ReplaceHoursAsync(Guid businessId, IEnumerable<BusinessHours> hours);
}