namespace Expade.API.Contracts.Businesses.Requests;
public record CreateBusinessFromRequest(
    Guid RequestId, 
    string Description, 
    List<ServiceInput> Services, 
    List<WorkerInput> Workers
);

public record ServiceInput(string Name, string Description, decimal Price, int DurationInMinutes);
public record WorkerInput(string Email);