using Expade.Core.Enums;

namespace Expade.Core.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    
    // Foreign Key to the User booking the appointment (The Client)
    public Guid ClientId { get; set; }
    public User Client { get; set; } = null!;
    
    // Foreign Key to the Worker performing the service
    public Guid WorkerId { get; set; }
    public Worker Worker { get; set; } = null!;
    
    // Foreign Key to the Service being rendered
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    
    // Use DateTimeOffset to automatically handle timezones!
    public DateTimeOffset StartDateTime { get; set; }
    
    public AppointmentStatus Status { get; set; }
}