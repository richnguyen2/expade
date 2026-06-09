namespace Expade.Core.Entities;

public class Business
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; } 
    public double Longitude { get; set; }
    // Navigation properties
    public ICollection<Worker> Workers { get; set; } = new List<Worker>();
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
