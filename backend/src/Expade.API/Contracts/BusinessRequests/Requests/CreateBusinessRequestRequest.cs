namespace Expade.API.Contracts.BusinessRequests.Requests;
public record CreateBusinessRequestRequest(string Name, string Phone, Guid CategoryId, string Address);