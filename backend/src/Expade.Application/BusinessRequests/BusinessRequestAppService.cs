using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;

namespace Expade.Application.BusinessRequests;

public class BusinessRequestAppService : IBusinessRequestAppService
{
    private readonly IBusinessRequestRepository _requests;
    private readonly IUserRepository _users;
    private readonly IBusinessRepository _businesses;
    private readonly IGeocodingService _geocoding;
    private readonly IEmailService _email;
    private readonly IClerkService _clerk;

    public BusinessRequestAppService(
        IBusinessRequestRepository requests,
        IUserRepository users,
        IBusinessRepository businesses,
        IGeocodingService geocoding,
        IEmailService email,
        IClerkService clerk)
    {
        _requests = requests;
        _users = users;
        _businesses = businesses;
        _geocoding = geocoding;
        _email = email;
        _clerk = clerk;
    }

    public Task<IEnumerable<BusinessRequest>> GetAllAsync() => _requests.GetAllAsync();

    public async Task<BusinessRequest> SubmitAsync(string clerkId, SubmitBusinessRequestCommand command)
    {
        var user = await _users.GetByExternalIdAsync(clerkId)
            ?? throw new NotFoundException("User profile not found.");

        var coordinates = await _geocoding.GetCoordinatesAsync(command.Address)
            ?? throw new ValidationException("Could not geocode the provided address.");

        var request = new BusinessRequest
        {
            Name = command.Name,
            CategoryId = command.CategoryId,
            Address = command.Address,
            Phone = command.Phone,
            Latitude = coordinates.Lat,
            Longitude = coordinates.Lon,
            TimeZoneId = string.IsNullOrWhiteSpace(coordinates.TimeZoneId)
                ? "America/New_York"
                : coordinates.TimeZoneId,
            UserId = user.Id,
        };

        await _requests.AddAsync(request);

        if (!string.IsNullOrEmpty(user.Email))
            _ = _email.SendBusinessRequestConfirmationEmailAsync(user.Email, user.Username, request.Name);

        return request;
    }

    public async Task UpdateStatusAsync(Guid id, RequestStatus status)
    {
        var request = await _requests.GetByIdAsync(id)
            ?? throw new NotFoundException("Business request not found.");

        request.Status = status;

        var user = await _users.GetByIdAsync(request.UserId)
            ?? throw new NotFoundException("User not found for this request.");

        await _requests.UpdateAsync(request);

        if (status == RequestStatus.Approved)
        {
            _ = _email.SendBusinessRequestApprovedEmailAsync(user.Email, user.Username, request.Name, request.Id);

            // Promote the requester to BusinessOwner — never touch an Admin, and skip if already promoted.
            if (user.Role != UserRole.Admin && user.Role != UserRole.BusinessOwner)
            {
                user.Role = UserRole.BusinessOwner;
                await _users.UpdateAsync(user);

                if (!string.IsNullOrEmpty(user.ExternalId))
                    await _clerk.SetUserRoleAsync(user.ExternalId, nameof(UserRole.BusinessOwner));
            }
        }
        else if (status == RequestStatus.Rejected)
        {
            _ = _email.SendBusinessRequestRejectionEmailAsync(user.Email, user.Username, request.Name);
        }
    }

    public async Task<BusinessRequest> GetOnboardingDataAsync(Guid id, string clerkId)
    {
        var user = await _users.GetByExternalIdAsync(clerkId)
            ?? throw new NotFoundException("User profile not found.");

        var request = await _requests.GetByIdWithCategoryAsync(id)
            ?? throw new NotFoundException("Business request not found.");

        if (await _businesses.ExistsByRequestIdAsync(request.Id))
            throw new ConflictException("A business has already been created from this request.");

        if (request.UserId != user.Id)
            throw new ForbiddenException();

        if (request.Status != RequestStatus.Approved)
            throw new ValidationException("This business request has not been approved yet.");

        return request;
    }
}
