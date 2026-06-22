using Expade.Core.Entities;
using Expade.Core.Enums;

namespace Expade.Application.BusinessRequests;

/// <summary>Fields needed to submit a new business request (mapped from the API contract by the endpoint).</summary>
public record SubmitBusinessRequestCommand(string Name, string Phone, Guid CategoryId, string Address);

public interface IBusinessRequestAppService
{
    Task<IEnumerable<BusinessRequest>> GetAllAsync();
    Task<BusinessRequest> SubmitAsync(string clerkId, SubmitBusinessRequestCommand command);
    Task UpdateStatusAsync(Guid id, RequestStatus status);

    /// <summary>Approved request (with Category) for the onboarding screen; enforces ownership + state.</summary>
    Task<BusinessRequest> GetOnboardingDataAsync(Guid id, string clerkId);
}
