namespace Expade.API.Contracts.Businesses.Requests;

public record CreateServiceRequest(string Name, string Description, decimal Price, int DurationInMinutes);