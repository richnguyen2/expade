using Expade.Core.Enums;
namespace Expade.Core.Entities;

public class BusinessRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; } // The user who requested it
    public User User { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; } 
    public double Longitude { get; set; }
    
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}