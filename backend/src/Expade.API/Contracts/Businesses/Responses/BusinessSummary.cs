namespace Expade.API.Contracts.Businesses.Responses;

public class BusinessSummaryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // e.g., "Owner", "Manager", "Staff"
}