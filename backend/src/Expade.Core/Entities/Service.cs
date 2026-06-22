namespace Expade.Core.Entities;

public class Service : IAuditable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationInMinutes { get; set; }
    public Guid BusinessId { get; set; }
    public Business Business { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}