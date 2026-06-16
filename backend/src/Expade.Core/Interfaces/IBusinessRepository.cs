using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(Guid id);
    Task<IEnumerable<Business>> GetAllAsync();
    Task<IEnumerable<Business>> GetBusinessesByUserIdAsync(Guid userId);
    Task AddAsync(Business business);
    Task UpdateAsync(Business business);
    Task AddServiceAsync(Service service);
    Task SaveChangesAsync();
    void RemoveService(Service service);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsByRequestIdAsync(Guid requestId);
}