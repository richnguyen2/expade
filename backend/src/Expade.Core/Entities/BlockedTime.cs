namespace Expade.Core.Entities;

/// <summary>
/// A span the business is unavailable for bookings — lunch, an external appointment, time off.
/// Stored as absolute instants; slot generation excludes any slot that overlaps a block.
/// </summary>
public class BlockedTime
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;

    public DateTimeOffset StartDateTime { get; set; }
    public DateTimeOffset EndDateTime { get; set; }

    /// <summary>Optional label, e.g. "Lunch" or "External booking".</summary>
    public string? Reason { get; set; }
}
