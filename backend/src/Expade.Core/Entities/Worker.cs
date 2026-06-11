using Expade.Core.Enums;

namespace Expade.Core.Entities;

public class Worker
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public WorkerRole Role { get; set; }
    public string Email { get; set; } = string.Empty;

    // Foreign Keys
    public Guid UserId { get; set; }
    public Guid BusinessId { get; set; }

    public string JobTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User User { get; set; } = null!;
    public Business Business { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}