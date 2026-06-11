using Expade.Core.Entities;
namespace Expade.API.Contracts.Businesses;
public record CreateBusinessFromRequest(
    Guid RequestId, 
    string Description, 
    List<ServiceInput> Services, 
    List<WorkerInput> Workers
);

public record ServiceInput(string Name, string Description);
public record WorkerInput(string Email);