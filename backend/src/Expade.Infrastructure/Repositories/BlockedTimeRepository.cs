using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;

public class BlockedTimeRepository : IBlockedTimeRepository
{
    private readonly AppDbContext _db;

    public BlockedTimeRepository(AppDbContext db) => _db = db;

    public async Task<BlockedTime?> GetByIdAsync(Guid id) =>
        await _db.BlockedTimes.FirstOrDefaultAsync(bt => bt.Id == id);

    public async Task<IEnumerable<BlockedTime>> GetByBusinessIdAsync(Guid businessId) =>
        await _db.BlockedTimes
            .Where(bt => bt.BusinessId == businessId)
            .OrderBy(bt => bt.StartDateTime)
            .ToListAsync();

    public async Task<IEnumerable<BlockedTime>> GetByBusinessAndDateAsync(Guid businessId, DateOnly date)
    {
        var startOfDay = new DateTimeOffset(date.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var endOfDay = startOfDay.AddDays(1);

        // Any block that overlaps the day window [start, end).
        return await _db.BlockedTimes
            .Where(bt =>
                bt.BusinessId == businessId &&
                bt.StartDateTime < endOfDay &&
                bt.EndDateTime > startOfDay)
            .ToListAsync();
    }

    public async Task AddAsync(BlockedTime blockedTime)
    {
        await _db.BlockedTimes.AddAsync(blockedTime);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(BlockedTime blockedTime)
    {
        _db.BlockedTimes.Remove(blockedTime);
        await _db.SaveChangesAsync();
    }
}
