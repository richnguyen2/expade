namespace Expade.API.Contracts.Businesses.Responses;

/// <summary>One day of weekly hours. Open/Close are "HH:mm" (24h); DayOfWeek 0=Sunday..6=Saturday.</summary>
public record BusinessHoursResponse(int DayOfWeek, bool IsOpen, string Open, string Close);
