using Expade.Application.Businesses;
using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

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

    [Fact]
    public async Task GetNearby_FiltersByBothRadiiAndSortsByDistance()
    {
        // User at (40.0, -75.0); search radius 25 mi.
        var inRangeNear = new Business { Name = "Near", Latitude = 40.0, Longitude = -75.0, ServiceRadiusMiles = 10 };   // ~0 mi
        var inRangeFar = new Business { Name = "Far", Latitude = 40.1, Longitude = -75.0, ServiceRadiusMiles = 10 };     // ~6.9 mi
        var beyondOwnRadius = new Business { Name = "TooFarForItself", Latitude = 40.3, Longitude = -75.0, ServiceRadiusMiles = 10 }; // ~20.7 mi > its 10
        var beyondUserRadius = new Business { Name = "TooFarForUser", Latitude = 40.5, Longitude = -75.0, ServiceRadiusMiles = 50 };  // ~34.5 mi > user 25

        _businesses.GetNearbyCandidatesAsync(Arg.Any<double>(), Arg.Any<double>(), Arg.Any<double>())
            .Returns(new[] { inRangeFar, beyondUserRadius, inRangeNear, beyondOwnRadius });

        var result = await _svc.GetNearbyAsync(40.0, -75.0, 25);

        Assert.Equal(2, result.Count);
        Assert.Equal("Near", result[0].Business.Name); // nearest first
        Assert.Equal("Far", result[1].Business.Name);
        Assert.True(result[0].DistanceMiles <= result[1].DistanceMiles);
    }

    [Fact]
    public async Task Delete_AsNonManager_ThrowsAndDoesNotDelete()
    {
        var businessId = Guid.NewGuid();
        _access.RequireManagerAsync(businessId, "clerk_1").ThrowsAsync(new ForbiddenException());

        await Assert.ThrowsAsync<ForbiddenException>(() => _svc.DeleteAsync(businessId, "clerk_1"));

        await _businesses.DidNotReceive().DeleteWithDependentsAsync(Arg.Any<Guid>());
    }

    [Fact]
    public async Task Delete_AsManager_EmailsActiveClientsAndDeletes()
    {
        var businessId = Guid.NewGuid();
        var user = new User { Id = Guid.NewGuid() };
        var business = new Business { Id = businessId, Name = "Cuts", TimeZoneId = "America/New_York" };
        var manager = new Worker { UserId = user.Id, Role = WorkerRole.Manager };
        _access.RequireManagerAsync(businessId, "clerk_1").Returns((user, business, manager));

        var client = new User { Id = Guid.NewGuid(), Email = "client@example.com", Username = "Sam" };
        _appointments.GetByBusinessIdAsync(businessId).Returns(new[]
        {
            new Appointment
            {
                ClientId = client.Id, Client = client,
                Service = new Service { Name = "Haircut" },
                StartDateTime = DateTimeOffset.UtcNow.AddDays(1),
                Status = AppointmentStatus.Confirmed,
            },
            new Appointment
            {
                ClientId = client.Id, Client = client,
                Service = new Service { Name = "Old" },
                StartDateTime = DateTimeOffset.UtcNow.AddDays(-1),
                Status = AppointmentStatus.Cancelled, // already cancelled — no email
            },
        });

        await _svc.DeleteAsync(businessId, "clerk_1");

        await _email.Received(1).SendAppointmentCancelledEmailAsync(
            "client@example.com", "Sam", "Cuts", "Haircut", Arg.Any<string>());
        await _businesses.Received(1).DeleteWithDependentsAsync(businessId);
    }
}
