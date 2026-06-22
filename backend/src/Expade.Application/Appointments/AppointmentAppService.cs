using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using Expade.Core.Services;

namespace Expade.Application.Appointments;

public class AppointmentAppService : IAppointmentAppService
{
    private readonly IBusinessRepository _businesses;
    private readonly IAppointmentRepository _appointments;
    private readonly IBlockedTimeRepository _blockedTimes;
    private readonly IEmailService _email;
    private readonly IBusinessAccess _access;

    public AppointmentAppService(
        IBusinessRepository businesses,
        IAppointmentRepository appointments,
        IBlockedTimeRepository blockedTimes,
        IEmailService email,
        IBusinessAccess access)
    {
        _businesses = businesses;
        _appointments = appointments;
        _blockedTimes = blockedTimes;
        _email = email;
        _access = access;
    }

    public async Task<Appointment> BookAsync(string clerkId, Guid serviceId, DateTimeOffset startDateTime)
    {
        var client = await _access.ResolveUserAsync(clerkId);

        var business = await _businesses.GetByServiceIdAsync(serviceId)
            ?? throw new NotFoundException("Service not found.");
        var service = business.Services.First(s => s.Id == serviceId);

        // Business-specific model: auto-assign the Manager (fallback first worker).
        var worker = business.Workers.FirstOrDefault(w => w.Role == WorkerRole.Manager)
                     ?? business.Workers.FirstOrDefault()
                     ?? throw new ValidationException("This business has no staff to take bookings.");

        // Re-validate against current availability (guards races / tampering), in the business timezone.
        var date = SlotGenerator.LocalDateFor(startDateTime, business.TimeZoneId);
        var dayHours = business.Hours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
        var existing = await _appointments.GetByWorkerAndDateAsync(worker.Id, date);
        var blocked = await _blockedTimes.GetByBusinessAndDateAsync(business.Id, date);
        var slots = SlotGenerator.Generate(
            dayHours, service.DurationInMinutes, date, existing, blocked, DateTimeOffset.UtcNow, business.TimeZoneId);

        if (!slots.Contains(startDateTime))
            throw new ValidationException("That time slot is no longer available.");

        var appointment = new Appointment
        {
            ClientId = client.Id,
            WorkerId = worker.Id,
            ServiceId = service.Id,
            // Persist as UTC — PostgreSQL `timestamp with time zone` (Npgsql) requires offset 0.
            StartDateTime = startDateTime.ToUniversalTime(),
            Status = AppointmentStatus.Pending,
        };

        await _appointments.AddAsync(appointment);
        var created = await _appointments.GetByIdAsync(appointment.Id);

        // Notify the assigned staff member (fire-and-forget).
        if (!string.IsNullOrEmpty(created!.Worker?.Email))
        {
            _ = _email.SendNewAppointmentEmailAsync(
                created.Worker.Email,
                created.Worker.User?.Username ?? "there",
                created.Client?.Username ?? "A customer",
                created.Service.Name,
                FormatWhen(created.StartDateTime, business.TimeZoneId));
        }

        return created;
    }

    public async Task<IEnumerable<Appointment>> GetMyAsync(string clerkId)
    {
        var user = await _access.ResolveUserAsync(clerkId);
        return await _appointments.GetByClientIdAsync(user.Id);
    }

    public async Task<Appointment> UpdateStatusAsync(Guid id, string clerkId, AppointmentStatus status)
    {
        var user = await _access.ResolveUserAsync(clerkId);

        var appointment = await _appointments.GetByIdAsync(id)
            ?? throw new NotFoundException("Appointment not found.");

        var isClient = appointment.ClientId == user.Id;
        var business = await _businesses.GetByServiceIdAsync(appointment.ServiceId);
        var isStaff = business?.Workers.Any(w => w.UserId == user.Id) ?? false;

        // A client may cancel their own; staff may confirm/complete/cancel.
        if (status == AppointmentStatus.Cancelled)
        {
            if (!isClient && !isStaff) throw new ForbiddenException();
        }
        else if (!isStaff)
        {
            throw new ForbiddenException();
        }

        appointment.Status = status;
        await _appointments.UpdateAsync(appointment);
        var updated = await _appointments.GetByIdAsync(appointment.Id);

        // Tell the client when staff confirm the booking (fire-and-forget).
        if (status == AppointmentStatus.Confirmed && isStaff && !string.IsNullOrEmpty(updated!.Client?.Email))
        {
            var biz = updated.Service.Business;
            _ = _email.SendAppointmentConfirmedEmailAsync(
                updated.Client.Email,
                updated.Client.Username,
                biz?.Name ?? "The business",
                updated.Service.Name,
                FormatWhen(updated.StartDateTime, biz?.TimeZoneId ?? "America/New_York"));
        }

        return updated!;
    }

    /// <summary>Format an instant as a friendly wall-clock string in the business's timezone.</summary>
    private static string FormatWhen(DateTimeOffset instant, string timeZoneId)
    {
        var tz = SlotGenerator.ResolveTimeZone(timeZoneId);
        var local = TimeZoneInfo.ConvertTime(instant, tz);
        return local.ToString("dddd, MMMM d, yyyy 'at' h:mm tt");
    }
}
