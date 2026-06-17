using Expade.Core.Enums;

namespace Expade.API.Contracts.BusinessRequests.Responses;

public record BusinessRequestResponse(
    Guid Id,
    string Name,
    string Phone,
    string Address,
    string CategoryName,
    RequestStatus Status,
    DateTime CreatedAt
);
