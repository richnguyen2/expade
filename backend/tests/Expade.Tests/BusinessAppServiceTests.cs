using Expade.Application.Businesses;
using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using NSubstitute;

namespace Expade.Tests;

public class BusinessAppServiceTests
{
    private readonly IBusinessRepository _businesses = Substitute.For<IBusinessRepository>();
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IBusinessRequestRepository _requests = Substitute.For<IBusinessRequestRepository>();
    private readonly IAppointmentRepository _appointments = Substitute.For<IAppointmentRepository>();
    private readonly IBlockedTimeRepository _blocked = Substitute.For<IBlockedTimeRepository>();
    private readonly IEmailService _email = Substitute.For<IEmailService>();
    private readonly IBusinessAccess _access = Substitute.For<IBusinessAccess>();
    private readonly BusinessAppService _svc;

    public BusinessAppServiceTests() =>
        _svc = new BusinessAppService(_businesses, _users, _requests, _appointments, _blocked, _email, _access);

    [Fact]
    public async Task AddService_AsManager_PersistsServiceWithDuration()
    {
        var businessId = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid() };
        var business = new Business { Id = businessId };
        var manager = new Worker { UserId = user.Id, Role = WorkerRole.Manager };
        _access.RequireManagerAsync(businessId, "clerk_1").Returns((user, business, manager));

        var result = await _svc.AddServiceAsync(businessId, "clerk_1",
            new ServiceCommand("Cut", "A cut", 25m, 45));

        Assert.Equal("Cut", result.Name);
        Assert.Equal(45, result.DurationInMinutes); // duration is captured (previously dropped)
        Assert.Equal(businessId, result.BusinessId);
        await _businesses.Received(1).AddServiceAsync(Arg.Any<Service>());
        await _businesses.Received(1).SaveChangesAsync();
    }

    [Fact]
    public async Task CreateFromRequest_RejectsUnapprovedRequest()
    {
        var user = new User { Id = Guid.NewGuid() };
        var reqId = Guid.NewGuid();
        _access.ResolveUserAsync("clerk_1").Returns(user);
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest
        {
            Id = reqId,
            UserId = user.Id,
            Status = RequestStatus.Pending,
        });

        var cmd = new CreateBusinessCommand(reqId, "desc", [], [], []);
        await Assert.ThrowsAsync<ValidationException>(() => _svc.CreateFromRequestAsync("clerk_1", cmd));
    }

    [Fact]
    public async Task CreateFromRequest_RejectsDuplicateOnboarding()
    {
        var user = new User { Id = Guid.NewGuid() };
        var reqId = Guid.NewGuid();
        _access.ResolveUserAsync("clerk_1").Returns(user);
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest
        {
            Id = reqId,
            UserId = user.Id,
            Status = RequestStatus.Approved,
        });
        _businesses.ExistsByRequestIdAsync(reqId).Returns(true);

        var cmd = new CreateBusinessCommand(reqId, "desc", [], [], []);
        await Assert.ThrowsAsync<ConflictException>(() => _svc.CreateFromRequestAsync("clerk_1", cmd));
    }

    [Fact]
    public async Task CreateFromRequest_RejectsNonOwner()
    {
        var user = new User { Id = Guid.NewGuid() };
        var reqId = Guid.NewGuid();
        _access.ResolveUserAsync("clerk_1").Returns(user);
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest
        {
            Id = reqId,
            UserId = Guid.NewGuid(), // someone else
            Status = RequestStatus.Approved,
        });

        var cmd = new CreateBusinessCommand(reqId, "desc", [], [], []);
        await Assert.ThrowsAsync<ForbiddenException>(() => _svc.CreateFromRequestAsync("clerk_1", cmd));
    }
}
