namespace Expade.API.Contracts.Businesses.Requests;

public record UpdateServiceRequest(string Name, string Description, decimal Price, int DurationInMinutes);