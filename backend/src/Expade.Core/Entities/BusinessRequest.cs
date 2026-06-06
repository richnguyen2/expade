namespace Expade.Core.Entities;

public class BusinessRequest
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // The user who requested it
    public User User { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public enum RequestStatus
{
    Pending,
    Approved,
    Rejected
}