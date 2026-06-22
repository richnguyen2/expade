namespace Expade.API.Contracts.Businesses.Responses;

public record BlockedTimeResponse(
    Guid Id,
    DateTimeOffset StartDateTime,
    DateTimeOffset EndDateTime,
    string? Reason
);
