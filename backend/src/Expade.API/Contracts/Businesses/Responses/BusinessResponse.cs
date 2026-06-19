namespace Expade.API.Contracts.Businesses.Responses;

public record BusinessResponse(
    Guid Id,
    string Name,
    string Description,
    string Phone,
    string Address,
    string CategoryName,
    string TimeZoneId,
    List<ServiceResponse> Services,
    List<WorkerResponse> Workers
);

public record WorkerResponse(
    Guid Id,
    string Email,
    string JobTitle,
    string Role // enum converted to string for the frontend
);
