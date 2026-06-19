using System.Security.Claims;
using Expade.API.Contracts.Appointments.Requests;
using Expade.API.Mappings;
using Expade.API.Services;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;

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
            IUserRepository userRepository,
            IBusinessRepository businessRepository,
            IAppointmentRepository appointmentRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

            var client = await userRepository.GetByExternalIdAsync(clerkId);
            if (client == null) return Results.NotFound("User profile not found.");

            var business = await businessRepository.GetByServiceIdAsync(request.ServiceId);
            if (business == null) return Results.NotFound("Service not found.");

            var service = business.Services.First(s => s.Id == request.ServiceId);

            var worker = business.Workers.FirstOrDefault(w => w.Role == WorkerRole.Manager)
                         ?? business.Workers.FirstOrDefault();
            if (worker == null) return Results.BadRequest("This business has no staff to take bookings.");

            // Re-validate the requested time against current availability (guards races / tampering).
            // The date is resolved in the business's timezone so a late-evening slot isn't pushed to
            // the wrong calendar day by the UTC offset.
            var date = SlotGenerator.LocalDateFor(request.StartDateTime, business.TimeZoneId);
            var dayHours = business.Hours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
            var existing = await appointmentRepository.GetByWorkerAndDateAsync(worker.Id, date);
            var slots = SlotGenerator.Generate(
                dayHours, service.DurationInMinutes, date, existing, DateTimeOffset.UtcNow, business.TimeZoneId);

            if (!slots.Contains(request.StartDateTime))
                return Results.BadRequest("That time slot is no longer available.");

            var appointment = new Appointment
            {
                ClientId = client.Id,
                WorkerId = worker.Id,
                ServiceId = service.Id,
                StartDateTime = request.StartDateTime,
                Status = AppointmentStatus.Pending
            };

            await appointmentRepository.AddAsync(appointment);

            var created = await appointmentRepository.GetByIdAsync(appointment.Id);
            return Results.Created($"/api/appointments/{appointment.Id}", created!.ToResponse());
        }).RequireAuthorization();

        // The signed-in client's appointments.
        group.MapGet("/my", async (
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IAppointmentRepository appointmentRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User profile not found.");

            var appointments = await appointmentRepository.GetByClientIdAsync(user.Id);
            return Results.Ok(appointments.Select(a => a.ToResponse()));
        }).RequireAuthorization();

        // Update status: a client may cancel their own; a worker at the business may confirm/complete/cancel.
        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            UpdateAppointmentStatusRequest request,
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IAppointmentRepository appointmentRepository,
            IBusinessRepository businessRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User profile not found.");

            var appointment = await appointmentRepository.GetByIdAsync(id);
            if (appointment == null) return Results.NotFound("Appointment not found.");

            var isClient = appointment.ClientId == user.Id;
            var business = await businessRepository.GetByServiceIdAsync(appointment.ServiceId);
            var isStaff = business?.Workers.Any(w => w.UserId == user.Id) ?? false;

            if (request.Status == AppointmentStatus.Cancelled)
            {
                if (!isClient && !isStaff) return Results.Forbid();
            }
            else if (!isStaff)
            {
                return Results.Forbid();
            }

            appointment.Status = request.Status;
            await appointmentRepository.UpdateAsync(appointment);

            var updated = await appointmentRepository.GetByIdAsync(appointment.Id);
            return Results.Ok(updated!.ToResponse());
        }).RequireAuthorization();
    }
}
