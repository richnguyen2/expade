using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;

namespace Expade.Application.Common;

/// <summary>
/// Shared identity + authorization resolution for business-scoped use cases —
/// replaces the ~10-line claim→user→business→worker boilerplate the endpoints used to repeat.
/// </summary>
public interface IBusinessAccess
{
    Task<User> ResolveUserAsync(string clerkId);
    Task<(User User, Business Business, Worker Worker)> RequireManagerAsync(Guid businessId, string clerkId);
    Task<(User User, Business Business)> RequireStaffAsync(Guid businessId, string clerkId);
}

public class BusinessAccess : IBusinessAccess
{
    private readonly IUserRepository _users;
    private readonly IBusinessRepository _businesses;

    public BusinessAccess(IUserRepository users, IBusinessRepository businesses)
    {
        _users = users;
        _businesses = businesses;
    }

    public async Task<User> ResolveUserAsync(string clerkId) =>
        await _users.GetByExternalIdAsync(clerkId) ?? throw new NotFoundException("User profile not found.");

    public async Task<(User User, Business Business, Worker Worker)> RequireManagerAsync(Guid businessId, string clerkId)
    {
        var user = await ResolveUserAsync(clerkId);
        var business = await _businesses.GetByIdAsync(businessId)
            ?? throw new NotFoundException("Business not found.");

        var worker = business.Workers.FirstOrDefault(w => w.UserId == user.Id)
            ?? throw new ForbiddenException();
        if (worker.Role != WorkerRole.Manager)
            throw new ForbiddenException("Only managers can manage this business.");

        return (user, business, worker);
    }

    public async Task<(User User, Business Business)> RequireStaffAsync(Guid businessId, string clerkId)
    {
        var user = await ResolveUserAsync(clerkId);
        var business = await _businesses.GetByIdAsync(businessId)
            ?? throw new NotFoundException("Business not found.");

        if (!business.Workers.Any(w => w.UserId == user.Id))
            throw new ForbiddenException();

        return (user, business);
    }
}
