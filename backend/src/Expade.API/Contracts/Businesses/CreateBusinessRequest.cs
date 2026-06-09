using Expade.Core.Entities;
namespace Expade.API.Contracts.Businesses;
public record CreateBusinessRequest(string Name, string Description, Guid CategoryId, string Address);