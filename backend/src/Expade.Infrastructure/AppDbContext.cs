using Expade.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<BusinessRequest> BusinessRequests => Set<BusinessRequest>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Worker> Workers => Set<Worker>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Ensure Clerk ExternalId is unique for fast lookups
        modelBuilder.Entity<User>()
            .HasIndex(u => u.ExternalId)
            .IsUnique();
        
        // Track who requested a business
        modelBuilder.Entity<BusinessRequest>()
            .HasOne(br => br.User)
            .WithMany()
            .HasForeignKey(br => br.UserId);

        // Prevent duplicate employment records
        modelBuilder.Entity<Worker>()
            .HasIndex(w => new { w.UserId, w.BusinessId })
            .IsUnique();

        // Configure 1-to-Many: User -> Workers
        modelBuilder.Entity<Worker>()
            .HasOne(w => w.User)
            .WithMany(u => u.WorkerProfiles)
            .HasForeignKey(w => w.UserId);

        // Configure 1-to-Many: Business -> Workers
        modelBuilder.Entity<Worker>()
            .HasOne(w => w.Business)
            .WithMany(b => b.Workers)
            .HasForeignKey(w => w.BusinessId);

        // 1-to-Many: Business -> Services
        modelBuilder.Entity<Service>()
            .HasOne(s => s.Business)
            .WithMany(b => b.Services)
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Cascade); // Deleting a business deletes its services
        
        // 1-to-Many: Service -> Appointments
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Service)
            .WithMany(s => s.Appointments)
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent Service deletion if booked

        // 1-to-Many: Client (User) -> Appointments
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Client)
            .WithMany(u => u.ClientAppointments)
            .HasForeignKey(a => a.ClientId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent User deletion if they have bookings

        // 1-to-Many: Worker -> Appointments
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Worker)
            .WithMany(w => w.Appointments)
            .HasForeignKey(a => a.WorkerId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent Worker deletion if they are scheduled
    }
}