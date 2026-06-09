using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Expade.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Category>> GetActiveCategoriesAsync()
    {
        return await _db.Categories
                        .Where(c => c.IsActive)
                        .OrderBy(c => c.Name)
                        .ToListAsync();
    }
}