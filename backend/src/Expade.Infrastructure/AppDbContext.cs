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
    public DbSet<Category> Categories => Set<Category>();

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
        
        modelBuilder.Entity<BusinessRequest>()
        .HasOne(br => br.Category)
        .WithMany()
        .HasForeignKey(br => br.CategoryId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Business>()
        .HasOne(b => b.BusinessRequest)
        .WithOne(r => r.Business) 
        .HasForeignKey<Business>(b => b.RequestId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Business>()
            .HasOne(b => b.Category)
            .WithMany()
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

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

        var beautyId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var homeId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var autoId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var foodId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = beautyId, Name = "Beauty & Personal Care" },
            new Category { Id = homeId, Name = "Home Services" },
            new Category { Id = autoId, Name = "Automotive Services" },
            new Category { Id = foodId, Name = "Food & Dining" }

        );
    }
}