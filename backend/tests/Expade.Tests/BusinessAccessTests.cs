using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using NSubstitute;

namespace Expade.Tests;

public class BusinessAccessTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IBusinessRepository _businesses = Substitute.For<IBusinessRepository>();
    private readonly BusinessAccess _access;

    public BusinessAccessTests() => _access = new BusinessAccess(_users, _businesses);

    private (User user, Business business) Seed(WorkerRole role)
    {
        var user = new User { Id = Guid.NewGuid(), ExternalId = "clerk_1" };
        var business = new Business { Id = Guid.NewGuid() };
        business.Workers.Add(new Worker { UserId = user.Id, Role = role });

        _users.GetByExternalIdAsync("clerk_1").Returns(user);
        _businesses.GetByIdAsync(business.Id).Returns(business);
        return (user, business);
    }

    [Fact]
    public async Task RequireManager_AllowsManager()
    {
        var (_, business) = Seed(WorkerRole.Manager);
        var (_, _, worker) = await _access.RequireManagerAsync(business.Id, "clerk_1");
        Assert.Equal(WorkerRole.Manager, worker.Role);
    }

    [Fact]
    public async Task RequireManager_RejectsEmployee()
    {
        var (_, business) = Seed(WorkerRole.Employee);
        await Assert.ThrowsAsync<ForbiddenException>(() => _access.RequireManagerAsync(business.Id, "clerk_1"));
    }

    [Fact]
    public async Task RequireManager_RejectsNonMember()
    {
        var user = new User { Id = Guid.NewGuid(), ExternalId = "clerk_1" };
        var business = new Business { Id = Guid.NewGuid() }; // no workers
        _users.GetByExternalIdAsync("clerk_1").Returns(user);
        _businesses.GetByIdAsync(business.Id).Returns(business);

        await Assert.ThrowsAsync<ForbiddenException>(() => _access.RequireManagerAsync(business.Id, "clerk_1"));
    }

    [Fact]
    public async Task RequireManager_ThrowsNotFound_WhenUserMissing()
    {
        _users.GetByExternalIdAsync(Arg.Any<string>()).Returns((User?)null);
        await Assert.ThrowsAsync<NotFoundException>(() => _access.RequireManagerAsync(Guid.NewGuid(), "ghost"));
    }

    [Fact]
    public async Task RequireStaff_AllowsEmployee()
    {
        var (_, business) = Seed(WorkerRole.Employee);
        var (_, b) = await _access.RequireStaffAsync(business.Id, "clerk_1");
        Assert.Equal(business.Id, b.Id);
    }
}
