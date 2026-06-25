using System.Security.Claims;
using Expade.API.Contracts.Businesses.Requests;
using Expade.API.Contracts.Businesses.Responses;
using Expade.API.Extensions;
using Expade.API.Filters;
using Expade.API.Mappings;
using Expade.Application.Businesses;

namespace Expade.API.Endpoints;

public static class BusinessEndpoints
{
    public static void MapBusinessEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/businesses").WithTags("Businesses");

        group.MapGet("/", async (IBusinessAppService service) =>
        {
            var businesses = await service.GetAllAsync();
            return Results.Ok(businesses.Select(b => b.ToListItemResponse()));
        }).RequireAuthorization();

        group.MapGet("/{id:guid}", async (Guid id, IBusinessAppService service) =>
        {
            var business = await service.GetByIdAsync(id);
            return Results.Ok(business.ToResponse());
        }).RequireAuthorization();

        group.MapGet("/my-businesses", async (ClaimsPrincipal userPrincipal, IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var (userId, businesses) = await service.GetMyBusinessesAsync(clerkId);
            return Results.Ok(businesses.Select(b => b.ToSummaryResponse(userId)));
        }).RequireAuthorization("Worker");

        group.MapPatch("/{id:guid}", async (
            Guid id,
            UpdateBusinessRequest request,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            await service.UpdateAsync(id, clerkId, request.Phone, request.Description);
            return Results.NoContent();
        }).RequireAuthorization("Worker");

        // Delete a business and everything tied to it (services, team, hours, blocked times,
        // and all appointments). Manager-only — enforced in the app service.
        group.MapDelete("/{id:guid}", async (
            Guid id,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            await service.DeleteAsync(id, clerkId);
            return Results.NoContent();
        }).RequireAuthorization("BusinessOwnerOnly");

        group.MapPost("/create-from-request", async (
            ClaimsPrincipal userPrincipal,
            CreateBusinessFromRequest contract,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var command = new CreateBusinessCommand(
                contract.RequestId,
                contract.Description,
                contract.Services.Select(s => new ServiceItem(s.Name, s.Description, s.Price, s.DurationInMinutes)).ToList(),
                contract.Workers.Select(w => new WorkerItem(w.Email)).ToList(),
                contract.Hours.Select(h => new HoursItem(h.DayOfWeek, h.IsOpen, h.Open, h.Close)).ToList());

            var business = await service.CreateFromRequestAsync(clerkId, command);
            return Results.Created($"/api/businesses/{business.Id}", new { businessId = business.Id });
        }).RequireAuthorization().WithValidation<CreateBusinessFromRequest>();

        group.MapPost("/{id:guid}/services", async (
            Guid id,
            CreateServiceRequest request,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var created = await service.AddServiceAsync(id, clerkId,
                new ServiceCommand(request.Name, request.Description, request.Price, request.DurationInMinutes));
            return Results.Ok(created.ToResponse());
        }).RequireAuthorization("BusinessOwnerOnly").WithValidation<CreateServiceRequest>();

        group.MapPut("/{id:guid}/services/{serviceId:guid}", async (
            Guid id,
            Guid serviceId,
            UpdateServiceRequest request,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var updated = await service.UpdateServiceAsync(id, serviceId, clerkId,
                new ServiceCommand(request.Name, request.Description, request.Price, request.DurationInMinutes));
            return Results.Ok(updated.ToResponse());
        }).RequireAuthorization("BusinessOwnerOnly").WithValidation<UpdateServiceRequest>();

        group.MapDelete("/{id:guid}/services/{serviceId:guid}", async (
            Guid id,
            Guid serviceId,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            await service.DeleteServiceAsync(id, serviceId, clerkId);
            return Results.NoContent();
        }).RequireAuthorization("BusinessOwnerOnly");

        // ---- Weekly operating hours ----

        // GET hours — always returns all 7 days (missing days fall back to a closed default).
        group.MapGet("/{id:guid}/hours", async (Guid id, IBusinessAppService service) =>
        {
            var existing = (await service.GetHoursAsync(id)).ToDictionary(h => h.DayOfWeek);

            var week = Enumerable.Range(0, 7).Select(d =>
            {
                var day = (DayOfWeek)d;
                return existing.TryGetValue(day, out var h)
                    ? h.ToResponse()
                    : new BusinessHoursResponse(d, false, "09:00", "17:00");
            });

            return Results.Ok(week);
        }).RequireAuthorization();

        // PUT hours — managers only. Replaces the full week.
        group.MapPut("/{id:guid}/hours", async (
            Guid id,
            UpdateBusinessHoursRequest request,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var hours = request.Hours.Select(h => new HoursItem(h.DayOfWeek, h.IsOpen, h.Open, h.Close)).ToList();
            await service.UpdateHoursAsync(id, clerkId, hours);
            return Results.NoContent();
        }).RequireAuthorization("BusinessOwnerOnly");

        // GET available booking slots for a service on a date (slots stepped by service duration).
        group.MapGet("/{id:guid}/availability", async (
            Guid id,
            Guid serviceId,
            DateOnly date,
            IBusinessAppService service) =>
        {
            var slots = await service.GetAvailabilityAsync(id, serviceId, date);
            return Results.Ok(slots);
        }).RequireAuthorization();

        // Owner/staff schedule view: every appointment for this business.
        group.MapGet("/{id:guid}/appointments", async (
            Guid id,
            ClaimsPrincipal userPrincipal,
            IBusinessAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var appointments = await service.GetBusinessAppointmentsAsync(id, clerkId);
            return Results.Ok(appointments.Select(a => a.ToResponse()));
        }).RequireAuthorization("Worker");
    }
}
