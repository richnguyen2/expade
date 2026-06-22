using Expade.Core.Entities;
using Expade.Core.Enums;
namespace Expade.Core.Interfaces;


public interface IBusinessRequestRepository
{
    Task<IEnumerable<BusinessRequest>> GetAllAsync();
    Task<BusinessRequest?> GetByIdAsync(Guid id);
    /// <summary>Includes the Category nav property — used for onboarding pre-fill.</summary>
    Task<BusinessRequest?> GetByIdWithCategoryAsync(Guid id);
    Task AddAsync(BusinessRequest request);
    Task UpdateAsync(BusinessRequest request);
}