using Expade.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Business> Businesses { get; set; }
}