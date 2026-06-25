namespace Expade.API.Contracts.Businesses.Requests;

public record UpdateBusinessRequest
{
    public string Phone { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public int ServiceRadiusMiles { get; init; } = 10;
}