namespace Expade.API.Contracts.Businesses.Responses;

public record ServiceResponse(Guid Id, string Name, string Description, decimal Price, int DurationInMinutes);