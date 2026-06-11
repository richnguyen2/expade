using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(Guid id);
    Task<IEnumerable<Business>> GetAllAsync();
    Task AddAsync(Business business);
    Task UpdateAsync(Business business);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsByRequestIdAsync(Guid requestId);
}