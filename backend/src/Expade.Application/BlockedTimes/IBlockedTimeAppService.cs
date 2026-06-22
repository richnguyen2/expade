using Expade.Core.Entities;

namespace Expade.Application.BlockedTimes;

public interface IBlockedTimeAppService
{
    Task<IEnumerable<BlockedTime>> GetAsync(Guid businessId, string clerkId);
    Task<BlockedTime> CreateAsync(Guid businessId, string clerkId, DateOnly date, string start, string end, string? reason);
    Task DeleteAsync(Guid businessId, Guid blockId, string clerkId);
}
