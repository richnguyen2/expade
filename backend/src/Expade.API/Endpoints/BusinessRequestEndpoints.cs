using System.Security.Claims;
using Expade.API.Contracts.BusinessRequests.Requests;
using Expade.API.Extensions;
using Expade.API.Filters;
using Expade.API.Mappings;
using Expade.Application.BusinessRequests;

namespace Expade.API.Endpoints;

public static class BusinessRequestEndpoints
{
    public static void MapBusinessRequestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/business-requests").WithTags("BusinessRequests");

        group.MapGet("/", async (IBusinessRequestAppService service) =>
        {
            var requests = await service.GetAllAsync();
            return Results.Ok(requests.Select(r => r.ToResponse()));
        }).RequireAuthorization("AdminOnly");

        group.MapPost("/", async (
            ClaimsPrincipal userPrincipal,
            CreateBusinessRequestRequest request,
            IBusinessRequestAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var created = await service.SubmitAsync(
                clerkId,
                new SubmitBusinessRequestCommand(request.Name, request.Phone, request.CategoryId, request.Address));

            return Results.Created($"/business-requests/{created.Id}", created.ToResponse());
        }).RequireAuthorization().WithValidation<CreateBusinessRequestRequest>();

        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            UpdateBusinessRequestStatusRequest request,
            IBusinessRequestAppService service) =>
        {
            await service.UpdateStatusAsync(id, request.Status);
            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");

        group.MapGet("/{id:guid}/onboarding-data", async (
            Guid id,
            ClaimsPrincipal userPrincipal,
            IBusinessRequestAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var request = await service.GetOnboardingDataAsync(id, clerkId);
            return Results.Ok(request.ToOnboardResponse());
        }).RequireAuthorization();
    }
}
