using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.Businesses;

namespace Expade.API.Endpoints;

public static class BusinessEndpoints
{
    public static void MapBusinessEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/businesses").WithTags("Businesses");

        group.MapGet("/", async (IBusinessRepository repository) =>
        {
            var businesses = await repository.GetAllAsync();
            return Results.Ok(businesses);
        });

        group.MapGet("/{id:guid}", async (Guid id, IBusinessRepository repository) =>
        {
            var business = await repository.GetByIdAsync(id);
            return business is not null ? Results.Ok(business) : Results.NotFound();
        });

        group.MapPost("/", async (CreateBusinessRequest request, IBusinessRepository repository) =>
        {
            var newBusiness = new Business
            {
                Name = request.Name,
                Description = request.Description,
                Category = request.Category
            };

            await repository.AddAsync(newBusiness);
            return Results.Created($"/businesses/{newBusiness.Id}", newBusiness);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateBusinessRequest request, IBusinessRepository repository) =>
        {
            var business = await repository.GetByIdAsync(id);
            if (business is null) return Results.NotFound();

            business.Name = request.Name;
            business.Description = request.Description;
            business.Category = request.Category;

            await repository.UpdateAsync(business);
            return Results.NoContent();
        });

        group.MapDelete("/{id:guid}", async (Guid id, IBusinessRepository repository) =>
        {
            var wasDeleted = await repository.DeleteAsync(id);
            return wasDeleted ? Results.NoContent() : Results.NotFound();
        });
    }
}