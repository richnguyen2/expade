namespace Expade.API.Contracts.Businesses.Responses;

public class BusinessResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty; // Flattened from Category
    
    // Child lists using their own DTOs
    public List<ServiceResponse> Services { get; set; } = new();
    public List<WorkerResponse> Workers { get; set; } = new();
}
public class WorkerResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Converted enum to string for the frontend
}