using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.Core.Enums;

using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;


public class BusinessRequestRepository : IBusinessRequestRepository
{
    private readonly AppDbContext _db;

    public BusinessRequestRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<BusinessRequest>> GetAllAsync()
    {
        return await _db.BusinessRequests
        .Include(r => r.Category)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();
    }

    public async Task<BusinessRequest?> GetByIdAsync(Guid id) =>
        await _db.BusinessRequests.FindAsync(id);

    public async Task<BusinessRequest?> GetByIdWithCategoryAsync(Guid id) =>
        await _db.BusinessRequests
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

    public async Task AddAsync(BusinessRequest request)
    {
        await _db.BusinessRequests.AddAsync(request);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(BusinessRequest request)
    {
        _db.BusinessRequests.Update(request);
        await _db.SaveChangesAsync();
    }
}