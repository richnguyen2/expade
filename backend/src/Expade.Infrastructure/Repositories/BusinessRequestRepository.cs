using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.Core.Enums;

using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;


public class BusinessRequestRepository : IBusinessRequestRepository
{
    private readonly AppDbContext _db;

    public BusinessRequestRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<BusinessRequest>> GetAllAsync(RequestStatus? status = null)
    {
        var query = _db.BusinessRequests.AsQueryable();
        
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        
        return await query.ToListAsync();
    }

    public async Task<BusinessRequest?> GetByIdAsync(Guid id) =>
        await _db.BusinessRequests.FindAsync(id);

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