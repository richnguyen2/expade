using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface IBlockedTimeRepository
{
    Task<BlockedTime?> GetByIdAsync(Guid id);

    /// <summary>All blocks for a business, soonest first — the schedule view.</summary>
    Task<IEnumerable<BlockedTime>> GetByBusinessIdAsync(Guid businessId);

    /// <summary>Blocks overlapping a given UTC date — used when generating a day's slots.</summary>
    Task<IEnumerable<BlockedTime>> GetByBusinessAndDateAsync(Guid businessId, DateOnly date);

    Task AddAsync(BlockedTime blockedTime);
    Task DeleteAsync(BlockedTime blockedTime);
}
