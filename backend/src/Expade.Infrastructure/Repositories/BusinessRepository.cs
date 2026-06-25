using Expade.Core.Entities;
using Expade.Core.Interfaces;

using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;

public class BusinessRepository : IBusinessRepository
{
    private readonly AppDbContext _context;

    public BusinessRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Business?> GetByIdAsync(Guid id)
        => await _context.Businesses
            .Include(b => b.Category)
            .Include(b => b.Services)
            .Include(b => b.Workers)
            .ThenInclude(w => w.User)
            .Include(b => b.Hours)
            .FirstOrDefaultAsync(b => b.Id == id);
    public async Task<Business?> GetByServiceIdAsync(Guid serviceId)
        => await _context.Businesses
            .Include(b => b.Services)
            .Include(b => b.Workers)
            .ThenInclude(w => w.User)
            .Include(b => b.Hours)
            .FirstOrDefaultAsync(b => b.Services.Any(s => s.Id == serviceId));

    public async Task<IEnumerable<Business>> GetBusinessesByUserIdAsync(Guid userId)
{
    return await _context.Businesses
        .Where(b => b.Workers.Any(w => w.UserId == userId))
        .Include(b => b.Category)
        .Include(b => b.Workers)
        .ToListAsync();
}

    public async Task<IEnumerable<Business>> GetAllAsync()
        => await _context.Businesses
            .Include(b => b.Category)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Business>> GetNearbyCandidatesAsync(double lat, double lon, double boundingRadiusMiles)
    {
        // Bounding-box prefilter: ~69 miles per degree of latitude; longitude degrees shrink with latitude.
        var latDelta = boundingRadiusMiles / 69.0;
        var lonDelta = boundingRadiusMiles / (69.0 * Math.Cos(lat * Math.PI / 180.0));

        var minLat = lat - latDelta;
        var maxLat = lat + latDelta;
        var minLon = lon - lonDelta;
        var maxLon = lon + lonDelta;

        return await _context.Businesses
            .Include(b => b.Category)
            .Where(b => b.Latitude >= minLat && b.Latitude <= maxLat
                     && b.Longitude >= minLon && b.Longitude <= maxLon)
            .ToListAsync();
    }

    public async Task AddAsync(Business business)
    {
        await _context.Businesses.AddAsync(business);
        await _context.SaveChangesAsync();
    }
    public async Task UpdateAsync(Business business)
    {
        _context.Businesses.Update(business);
        await _context.SaveChangesAsync();
    }
    public async Task AddServiceAsync(Service service)
    {
        await _context.Set<Service>().AddAsync(service);
    }
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
    public void RemoveService(Service service)
    {
        _context.Set<Service>().Remove(service);
    }
    public async Task<bool> DeleteAsync(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return false;
        _context.Businesses.Remove(business);
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task DeleteWithDependentsAsync(Guid id)
    {
        // Appointments reference Services/Workers with Restrict FKs, so they must be removed
        // before the business cascade (Services/Workers/Hours/BlockedTimes) can run.
        var appointments = await _context.Appointments
            .Where(a => a.Service.BusinessId == id)
            .ToListAsync();
        _context.Appointments.RemoveRange(appointments);

        var business = await _context.Businesses.FindAsync(id);
        if (business is not null)
            _context.Businesses.Remove(business);

        // Single SaveChanges => one transaction (appointment removal + cascade delete are atomic).
        await _context.SaveChangesAsync();
    }
    public async Task<bool> ExistsByRequestIdAsync(Guid requestId)
    {
        return await _context.Businesses.AnyAsync(b => b.RequestId == requestId);
    }

    public async Task<IEnumerable<BusinessHours>> GetHoursAsync(Guid businessId)
    {
        return await _context.BusinessHours
            .Where(h => h.BusinessId == businessId)
            .OrderBy(h => h.DayOfWeek)
            .ToListAsync();
    }

    public async Task ReplaceHoursAsync(Guid businessId, IEnumerable<BusinessHours> hours)
    {
        var existing = _context.BusinessHours.Where(h => h.BusinessId == businessId);
        _context.BusinessHours.RemoveRange(existing);

        foreach (var h in hours)
        {
            h.BusinessId = businessId;
            _context.BusinessHours.Add(h);
        }

        await _context.SaveChangesAsync();
    }
}