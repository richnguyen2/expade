namespace Expade.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ExternalId { get; set; } = string.Empty; // For Auth0 or other providers
    public UserRole Role { get; set; } = UserRole.User;
    public ICollection<Worker> WorkerProfiles { get; set; } = new List<Worker>();
    public ICollection<Appointment> ClientAppointments { get; set; } = new List<Appointment>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum UserRole
{
    User,
    Worker,
    Admin
}