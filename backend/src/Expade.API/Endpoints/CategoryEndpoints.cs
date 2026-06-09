using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.BusinessesRequests;
using Expade.Core.Enums;

namespace Expade.API.Endpoints;

public static class CategoryEndpoints
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/categories").WithTags("Categories");

         group.MapGet("/", async (ICategoryRepository repository) => 
         {
             var categories = await repository.GetActiveCategoriesAsync();
             return Results.Ok(categories);
         }).RequireAuthorization();
    }
}