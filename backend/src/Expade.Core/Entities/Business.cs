namespace Expade.Core.Entities;

public class Business : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public BusinessRequest BusinessRequest { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    /// <summary>IANA timezone (e.g. "America/Chicago") the business operates in. Drives slot generation and display.</summary>
    public string TimeZoneId { get; set; } = "America/New_York";
    // Navigation properties
    public ICollection<Worker> Workers { get; set; } = new List<Worker>();
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<BusinessHours> Hours { get; set; } = new List<BusinessHours>();
    public ICollection<BlockedTime> BlockedTimes { get; set; } = new List<BlockedTime>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
