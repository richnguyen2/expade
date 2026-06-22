using System.Security.Claims;
using Expade.API.Contracts.Appointments.Requests;
using Expade.API.Extensions;
using Expade.API.Mappings;
using Expade.Application.Appointments;

namespace Expade.API.Endpoints;

public static class AppointmentEndpoints
{
    public static void MapAppointmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/appointments").WithTags("Appointments");

        // Create a booking. Business-specific model: auto-assign the Manager (fallback first worker).
        group.MapPost("/", async (
            CreateAppointmentRequest request,
            ClaimsPrincipal userPrincipal,
            IAppointmentAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var appointment = await service.BookAsync(clerkId, request.ServiceId, request.StartDateTime);
            return Results.Created($"/api/appointments/{appointment.Id}", appointment.ToResponse());
        }).RequireAuthorization();

        // The signed-in client's appointments.
        group.MapGet("/my", async (ClaimsPrincipal userPrincipal, IAppointmentAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var appointments = await service.GetMyAsync(clerkId);
            return Results.Ok(appointments.Select(a => a.ToResponse()));
        }).RequireAuthorization();

        // Update status: client may cancel their own; staff may confirm/complete/cancel.
        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            UpdateAppointmentStatusRequest request,
            ClaimsPrincipal userPrincipal,
            IAppointmentAppService service) =>
        {
            var clerkId = userPrincipal.GetClerkId();
            if (clerkId is null) return Results.Unauthorized();

            var updated = await service.UpdateStatusAsync(id, clerkId, request.Status);
            return Results.Ok(updated.ToResponse());
        }).RequireAuthorization();
    }
}
