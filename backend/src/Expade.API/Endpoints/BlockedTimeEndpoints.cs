using System.Security.Claims;
using Expade.API.Contracts.Businesses.Requests;
using Expade.API.Extensions;
using Expade.API.Filters;
using Expade.API.Mappings;
using Expade.Application.BlockedTimes;

namespace Expade.API.Endpoints;

public static class BlockedTimeEndpoints
{
    public static void MapBlockedTimeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/businesses/{id:guid}/blocked-times").WithTags("BlockedTimes");

        // List all blocks for a business — any staff member may view.
        group.MapGet("/", async (Guid id, ClaimsPrincipal userPrincipal, IBlockedTimeAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var blocks = await service.GetAsync(id, clerkId);
            return Results.Ok(blocks.Select(b => b.ToResponse()));
        }).RequireAuthorization("Worker");

        // Create a block — managers only.
        group.MapPost("/", async (
            Guid id,
            CreateBlockedTimeRequest request,
            ClaimsPrincipal userPrincipal,
            IBlockedTimeAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var block = await service.CreateAsync(id, clerkId, request.Date, request.Start, request.End, request.Reason);
            return Results.Created($"/api/businesses/{id}/blocked-times/{block.Id}", block.ToResponse());
        }).RequireAuthorization("BusinessOwnerOnly").WithValidation<CreateBlockedTimeRequest>();

        // Delete a block — managers only.
        group.MapDelete("/{blockId:guid}", async (
            Guid id,
            Guid blockId,
            ClaimsPrincipal userPrincipal,
            IBlockedTimeAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            await service.DeleteAsync(id, blockId, clerkId);
            return Results.NoContent();
        }).RequireAuthorization("BusinessOwnerOnly");
    }
}
