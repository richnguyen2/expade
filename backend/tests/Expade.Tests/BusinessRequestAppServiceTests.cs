using Expade.Application.BusinessRequests;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using NSubstitute;

namespace Expade.Tests;

public class BusinessRequestAppServiceTests
{
    private readonly IBusinessRequestRepository _requests = Substitute.For<IBusinessRequestRepository>();
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IBusinessRepository _businesses = Substitute.For<IBusinessRepository>();
    private readonly IGeocodingService _geocoding = Substitute.For<IGeocodingService>();
    private readonly IEmailService _email = Substitute.For<IEmailService>();
    private readonly IClerkService _clerk = Substitute.For<IClerkService>();
    private readonly BusinessRequestAppService _svc;

    public BusinessRequestAppServiceTests() =>
        _svc = new BusinessRequestAppService(_requests, _users, _businesses, _geocoding, _email, _clerk);

    [Fact]
    public async Task Approve_PromotesRegularUserToBusinessOwner_AndSyncsClerk()
    {
        var reqId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest { Id = reqId, UserId = userId, Name = "Acme" });
        var user = new User
        {
            Id = userId,
            ExternalId = "clerk_x",
            Email = "a@b.com",
            Username = "a",
            Role = UserRole.User,
        };
        _users.GetByIdAsync(userId).Returns(user);

        await _svc.UpdateStatusAsync(reqId, RequestStatus.Approved);

        Assert.Equal(UserRole.BusinessOwner, user.Role);
        await _users.Received(1).UpdateAsync(user);
        await _clerk.Received(1).SetUserRoleAsync("clerk_x", nameof(UserRole.BusinessOwner));
        await _email.Received(1).SendBusinessRequestApprovedEmailAsync("a@b.com", "a", "Acme", reqId);
    }

    [Fact]
    public async Task Approve_DoesNotDemoteAdmin()
    {
        var reqId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest { Id = reqId, UserId = userId, Name = "Acme" });
        var admin = new User { Id = userId, ExternalId = "clerk_admin", Role = UserRole.Admin };
        _users.GetByIdAsync(userId).Returns(admin);

        await _svc.UpdateStatusAsync(reqId, RequestStatus.Approved);

        Assert.Equal(UserRole.Admin, admin.Role);
        await _clerk.DidNotReceive().SetUserRoleAsync(Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task Reject_SendsRejectionEmail()
    {
        var reqId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        _requests.GetByIdAsync(reqId).Returns(new BusinessRequest { Id = reqId, UserId = userId, Name = "Acme" });
        _users.GetByIdAsync(userId).Returns(new User { Id = userId, Email = "a@b.com", Username = "a" });

        await _svc.UpdateStatusAsync(reqId, RequestStatus.Rejected);

        await _email.Received(1).SendBusinessRequestRejectionEmailAsync("a@b.com", "a", "Acme");
    }
}
