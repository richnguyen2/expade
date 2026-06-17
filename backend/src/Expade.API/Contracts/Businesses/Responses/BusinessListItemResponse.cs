namespace Expade.API.Contracts.Businesses.Responses;

/// <summary>Public discovery card shape returned by GET /api/businesses.</summary>
public record BusinessListItemResponse(
    Guid Id,
    string Name,
    string Description,
    string CategoryName,
    string Address,
    string Phone
);
