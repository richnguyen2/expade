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
    public DbSet<BusinessHours> BusinessHours => Set<BusinessHours>();
    public DbSet<BlockedTime> BlockedTimes => Set<BlockedTime>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TouchTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        TouchTimestamps();
        return base.SaveChanges();
    }

    /// <summary>Stamp UpdatedAt on any added/modified auditable entity.</summary>
    private void TouchTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<IAuditable>())
            if (entry.State is EntityState.Added or EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
    }

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
        
        // 1-to-Many: Business -> Hours (deleting a business deletes its hours)
        modelBuilder.Entity<BusinessHours>()
            .HasOne(h => h.Business)
            .WithMany(b => b.Hours)
            .HasForeignKey(h => h.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // One hours row per (business, day)
        modelBuilder.Entity<BusinessHours>()
            .HasIndex(h => new { h.BusinessId, h.DayOfWeek })
            .IsUnique();

        // 1-to-Many: Business -> BlockedTimes (deleting a business deletes its blocks)
        modelBuilder.Entity<BlockedTime>()
            .HasOne(bt => bt.Business)
            .WithMany(b => b.BlockedTimes)
            .HasForeignKey(bt => bt.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // Lookups are by business + start time
        modelBuilder.Entity<BlockedTime>()
            .HasIndex(bt => new { bt.BusinessId, bt.StartDateTime });

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

        var beautyId = Guid.Parse("a2a8e21c-2323-4e88-8bac-013baca03e27");
        var homeId = Guid.Parse("016ee037-3bc6-4bd4-bef4-8b367272f0e7");
        var autoId = Guid.Parse("1bb5ca4a-42d6-4b25-9636-8849fd994532");
        var foodId = Guid.Parse("96024af6-27be-4f63-ad04-0f63f28d7175");
        var otherId = Guid.Parse("b20d749f-56b1-41af-910b-85d42f773b82");

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = beautyId, Name = "Beauty & Personal Care" },
            new Category { Id = homeId, Name = "Home Services" },
            new Category { Id = autoId, Name = "Automotive Services" },
            new Category { Id = foodId, Name = "Food & Dining" },
            new Category { Id = otherId, Name = "Other" }
        );
    }
}