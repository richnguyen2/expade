namespace Expade.API.Contracts.Businesses.Requests;
public record CreateBusinessFromRequest(
    Guid RequestId,
    string Description,
    List<ServiceInput> Services,
    List<WorkerInput> Workers,
    List<BusinessHoursInput> Hours
);

public record ServiceInput(string Name, string Description, decimal Price, int DurationInMinutes);
public record WorkerInput(string Email);

/// <summary>One day of weekly hours. Open/Close are "HH:mm" (24h). DayOfWeek 0=Sunday..6=Saturday.</summary>
public record BusinessHoursInput(int DayOfWeek, bool IsOpen, string Open, string Close);