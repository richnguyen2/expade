namespace Expade.API.Contracts.BusinessRequests.Responses;

public record BusinessRequestOnboardResponse(
    Guid Id,
    string Name,
    string Phone,
    string Address,
    Guid CategoryId,
    string CategoryName
);
