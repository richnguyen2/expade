using Expade.Core.Entities;
namespace Expade.API.Contracts.BusinessesRequests;
public record CreateBusinessRequestRequest(string Name, string Phone, Guid CategoryId, string Address);