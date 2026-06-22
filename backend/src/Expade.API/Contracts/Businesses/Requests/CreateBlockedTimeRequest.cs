namespace Expade.API.Contracts.Businesses.Requests;

/// <summary>
/// Block a span on a single day. Date + wall-clock Start/End ("HH:mm") are interpreted in the
/// business's timezone server-side, so the owner enters the times they actually see at the shop.
/// </summary>
public record CreateBlockedTimeRequest(
    DateOnly Date,
    string Start,
    string End,
    string? Reason
);
