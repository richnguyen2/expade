namespace Expade.API.Contracts.Businesses;
public record CreateBusinessRequest(string Name, string Description, string Category, string Address);