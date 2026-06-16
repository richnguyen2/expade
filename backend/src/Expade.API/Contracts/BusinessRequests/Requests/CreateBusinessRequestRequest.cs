namespace Expade.API.Contracts.BusinessesRequests.Requests;
public record CreateBusinessRequestRequest(string Name, string Phone, Guid CategoryId, string Address);