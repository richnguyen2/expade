namespace Expade.Core.Entities;

/// <summary>
/// Weekly operating hours for a business — one row per day of week.
/// Drives appointment slot generation.
/// </summary>
public class BusinessHours
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;

    public DayOfWeek DayOfWeek { get; set; }

    public bool IsOpen { get; set; }

    public TimeOnly OpenTime { get; set; }
    public TimeOnly CloseTime { get; set; }
}
