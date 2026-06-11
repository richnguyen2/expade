using Expade.Core.Entities;
using Expade.Core.Enums;
namespace Expade.Core.Interfaces;


public interface IBusinessRequestRepository
{
    Task<IEnumerable<BusinessRequest>> GetAllAsync();
    Task<BusinessRequest?> GetByIdAsync(Guid id);
    Task AddAsync(BusinessRequest request);
    Task UpdateAsync(BusinessRequest request);
}