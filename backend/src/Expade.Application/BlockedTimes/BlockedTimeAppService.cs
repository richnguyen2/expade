using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.Core.Services;

namespace Expade.Application.BlockedTimes;

public class BlockedTimeAppService : IBlockedTimeAppService
{
    private readonly IBlockedTimeRepository _blockedTimes;
    private readonly IBusinessAccess _access;

    public BlockedTimeAppService(IBlockedTimeRepository blockedTimes, IBusinessAccess access)
    {
        _blockedTimes = blockedTimes;
        _access = access;
    }

    public async Task<IEnumerable<BlockedTime>> GetAsync(Guid businessId, string clerkId)
    {
        await _access.RequireStaffAsync(businessId, clerkId);
        return await _blockedTimes.GetByBusinessIdAsync(businessId);
    }

    public async Task<BlockedTime> CreateAsync(
        Guid businessId, string clerkId, DateOnly date, string start, string end, string? reason)
    {
        var (_, business, _) = await _access.RequireManagerAsync(businessId, clerkId);

        if (!TimeOnly.TryParse(start, out var startTime) || !TimeOnly.TryParse(end, out var endTime))
            throw new ValidationException("Invalid start or end time.");
        if (endTime <= startTime)
            throw new ValidationException("End time must be after the start time.");

        // Interpret the wall-clock times in the business's timezone (stored as UTC instants).
        var block = new BlockedTime
        {
            BusinessId = businessId,
            StartDateTime = SlotGenerator.ToInstant(date, startTime, business.TimeZoneId),
            EndDateTime = SlotGenerator.ToInstant(date, endTime, business.TimeZoneId),
            Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim(),
        };

        await _blockedTimes.AddAsync(block);
        return block;
    }

    public async Task DeleteAsync(Guid businessId, Guid blockId, string clerkId)
    {
        await _access.RequireManagerAsync(businessId, clerkId);

        var block = await _blockedTimes.GetByIdAsync(blockId);
        if (block is null || block.BusinessId != businessId)
            throw new NotFoundException("Blocked time not found.");

        await _blockedTimes.DeleteAsync(block);
    }
}
