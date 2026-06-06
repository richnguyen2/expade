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
        => await _context.Businesses.FindAsync(id);

    public async Task<IEnumerable<Business>> GetAllAsync() 
        => await _context.Businesses.ToListAsync();

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
    public async Task<bool> DeleteAsync(Guid id)
    {
        var business = await _context.Businesses.FindAsync(id);
        if (business == null) return false;
        _context.Businesses.Remove(business);
        await _context.SaveChangesAsync();
        return true;
    }
}