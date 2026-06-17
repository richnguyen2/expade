namespace Expade.API.Contracts.Businesses.Responses;

/// <summary>Lightweight projection for a user's own businesses (My Businesses list).</summary>
public record BusinessSummaryResponse(
    Guid Id,
    string Name,
    string CategoryName,
    string Role // the requesting user's worker role at this business
);
