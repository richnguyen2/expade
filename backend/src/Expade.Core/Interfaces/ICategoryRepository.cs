using Expade.Core.Entities;

namespace Expade.Core.Interfaces;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetActiveCategoriesAsync();
}