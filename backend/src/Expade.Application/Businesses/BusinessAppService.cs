using Expade.Application.Common;
using Expade.Application.Exceptions;
using Expade.Core.Entities;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using Expade.Core.Services;

namespace Expade.Application.Businesses;

public class BusinessAppService : IBusinessAppService
{
    private readonly IBusinessRepository _businesses;
    private readonly IUserRepository _users;
    private readonly IBusinessRequestRepository _requests;
    private readonly IAppointmentRepository _appointments;
    private readonly IBlockedTimeRepository _blockedTimes;
    private readonly IEmailService _email;
    private readonly IBusinessAccess _access;

    public BusinessAppService(
        IBusinessRepository businesses,
        IUserRepository users,
        IBusinessRequestRepository requests,
        IAppointmentRepository appointments,
        IBlockedTimeRepository blockedTimes,
        IEmailService email,
        IBusinessAccess access)
    {
        _businesses = businesses;
        _users = users;
        _requests = requests;
        _appointments = appointments;
        _blockedTimes = blockedTimes;
        _email = email;
        _access = access;
    }

    public Task<IEnumerable<Business>> GetAllAsync() => _businesses.GetAllAsync();

    public async Task<IReadOnlyList<(Business Business, double DistanceMiles)>> GetNearbyAsync(
        double lat, double lon, double userRadiusMiles)
    {
        // Bounding box uses the user's search radius (the binding cap), then we filter exactly.
        var candidates = await _businesses.GetNearbyCandidatesAsync(lat, lon, userRadiusMiles);

        return candidates
            .Select(b => (Business: b, DistanceMiles: GeoMath.DistanceMiles(lat, lon, b.Latitude, b.Longitude)))
            .Where(x => x.DistanceMiles <= x.Business.ServiceRadiusMiles && x.DistanceMiles <= userRadiusMiles)
            .OrderBy(x => x.DistanceMiles)
            .ToList();
    }

    public async Task<Business> GetByIdAsync(Guid id) =>
        await _businesses.GetByIdAsync(id) ?? throw new NotFoundException("Business not found.");

    public async Task<(Guid UserId, IEnumerable<Business> Businesses)> GetMyBusinessesAsync(string clerkId)
    {
        var user = await _access.ResolveUserAsync(clerkId);
        var businesses = await _businesses.GetBusinessesByUserIdAsync(user.Id);
        return (user.Id, businesses);
    }

    public async Task UpdateAsync(Guid id, string clerkId, string phone, string description, int serviceRadiusMiles)
    {
        var (_, business, _) = await _access.RequireManagerAsync(id, clerkId);

        business.Phone = phone;
        business.Description = description;
        business.ServiceRadiusMiles = serviceRadiusMiles;
        await _businesses.UpdateAsync(business);
    }

    public async Task DeleteAsync(Guid businessId, string clerkId)
    {
        var (_, business, _) = await _access.RequireManagerAsync(businessId, clerkId);

        // Notify clients with an upcoming booking before everything is removed (fire-and-forget).
        var appointments = await _appointments.GetByBusinessIdAsync(businessId);
        foreach (var appt in appointments)
        {
            if (appt.Status is not (AppointmentStatus.Pending or AppointmentStatus.Confirmed)) continue;
            if (string.IsNullOrEmpty(appt.Client?.Email)) continue;

            _ = _email.SendAppointmentCancelledEmailAsync(
                appt.Client.Email,
                appt.Client.Username,
                business.Name,
                appt.Service.Name,
                FormatWhen(appt.StartDateTime, business.TimeZoneId));
        }

        await _businesses.DeleteWithDependentsAsync(businessId);
    }

    public async Task<Business> CreateFromRequestAsync(string clerkId, CreateBusinessCommand command)
    {
        var user = await _access.ResolveUserAsync(clerkId);

        var request = await _requests.GetByIdAsync(command.RequestId)
            ?? throw new NotFoundException("Associated business request not found.");
        if (request.UserId != user.Id)
            throw new ForbiddenException();
        if (request.Status != RequestStatus.Approved)
            throw new ValidationException("Request must be approved to onboard.");
        if (await _businesses.ExistsByRequestIdAsync(request.Id))
            throw new ConflictException("A business has already been created from this request.");

        var business = new Business
        {
            Name = request.Name,
            Phone = request.Phone,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            TimeZoneId = request.TimeZoneId,
            CategoryId = request.CategoryId,
            Description = command.Description,
            RequestId = request.Id,
        };

        // The owner is automatically the Manager.
        business.Workers.Add(new Worker { UserId = user.Id, Email = user.Email, Role = WorkerRole.Manager });

        foreach (var s in command.Services)
            business.Services.Add(new Service
            {
                Name = s.Name,
                Description = s.Description,
                Price = s.Price,
                DurationInMinutes = s.DurationInMinutes,
            });

        // Optional team members — they must already have an account.
        foreach (var w in command.Workers)
        {
            var staffUser = await _users.GetByEmailAsync(w.Email)
                ?? throw new ValidationException(
                    $"Cannot add staff: no user found with the email '{w.Email}'. They must create an account first.");

            business.Workers.Add(new Worker { UserId = staffUser.Id, Email = w.Email, Role = WorkerRole.Employee });
        }

        // Weekly hours are set at onboarding (required) so a live business never shows wrong hours.
        foreach (var h in command.Hours)
            business.Hours.Add(ToBusinessHours(h));

        await _businesses.AddAsync(business);

        _ = _email.SendBusinessLaunchedEmailAsync(user.Email, user.Username, request.Name);

        return business;
    }

    public async Task<Service> AddServiceAsync(Guid businessId, string clerkId, ServiceCommand command)
    {
        await _access.RequireManagerAsync(businessId, clerkId);

        var service = new Service
        {
            Name = command.Name,
            Description = command.Description,
            Price = command.Price,
            DurationInMinutes = command.DurationInMinutes,
            BusinessId = businessId,
        };

        await _businesses.AddServiceAsync(service);
        await _businesses.SaveChangesAsync();
        return service;
    }

    public async Task<Service> UpdateServiceAsync(Guid businessId, Guid serviceId, string clerkId, ServiceCommand command)
    {
        var (_, business, _) = await _access.RequireManagerAsync(businessId, clerkId);

        var service = business.Services.FirstOrDefault(s => s.Id == serviceId)
            ?? throw new NotFoundException("Service not found.");

        service.Name = command.Name;
        service.Description = command.Description;
        service.Price = command.Price;
        service.DurationInMinutes = command.DurationInMinutes;

        await _businesses.SaveChangesAsync();
        return service;
    }

    public async Task DeleteServiceAsync(Guid businessId, Guid serviceId, string clerkId)
    {
        var (_, business, _) = await _access.RequireManagerAsync(businessId, clerkId);

        var service = business.Services.FirstOrDefault(s => s.Id == serviceId)
            ?? throw new NotFoundException("Service not found.");

        _businesses.RemoveService(service);
        await _businesses.SaveChangesAsync();
    }

    public Task<IEnumerable<BusinessHours>> GetHoursAsync(Guid businessId) =>
        _businesses.GetHoursAsync(businessId);

    public async Task UpdateHoursAsync(Guid businessId, string clerkId, IReadOnlyList<HoursItem> hours)
    {
        await _access.RequireManagerAsync(businessId, clerkId);
        await _businesses.ReplaceHoursAsync(businessId, hours.Select(ToBusinessHours));
    }

    public async Task<IReadOnlyList<DateTimeOffset>> GetAvailabilityAsync(Guid businessId, Guid serviceId, DateOnly date)
    {
        var business = await _businesses.GetByIdAsync(businessId)
            ?? throw new NotFoundException("Business not found.");

        var service = business.Services.FirstOrDefault(s => s.Id == serviceId)
            ?? throw new NotFoundException("Service not found.");

        // Business-specific model: auto-assign the Manager (fallback first worker).
        var worker = business.Workers.FirstOrDefault(w => w.Role == WorkerRole.Manager)
                     ?? business.Workers.FirstOrDefault();
        if (worker is null) return Array.Empty<DateTimeOffset>();

        var dayHours = business.Hours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
        var existing = await _appointments.GetByWorkerAndDateAsync(worker.Id, date);
        var blocked = await _blockedTimes.GetByBusinessAndDateAsync(businessId, date);

        return SlotGenerator.Generate(
            dayHours, service.DurationInMinutes, date, existing, blocked, DateTimeOffset.UtcNow, business.TimeZoneId);
    }

    public async Task<IEnumerable<Appointment>> GetBusinessAppointmentsAsync(Guid businessId, string clerkId)
    {
        await _access.RequireStaffAsync(businessId, clerkId);
        return await _appointments.GetByBusinessIdAsync(businessId);
    }

    /* ---- helpers ---- */

    /// <summary>Format an instant as a friendly wall-clock string in the business's timezone.</summary>
    private static string FormatWhen(DateTimeOffset instant, string timeZoneId)
    {
        var tz = SlotGenerator.ResolveTimeZone(timeZoneId);
        var local = TimeZoneInfo.ConvertTime(instant, tz);
        return local.ToString("dddd, MMMM d, yyyy 'at' h:mm tt");
    }

    private static BusinessHours ToBusinessHours(HoursItem h) => new()
    {
        DayOfWeek = (DayOfWeek)h.DayOfWeek,
        IsOpen = h.IsOpen,
        OpenTime = TimeOnly.TryParse(h.Open, out var open) ? open : new TimeOnly(9, 0),
        CloseTime = TimeOnly.TryParse(h.Close, out var close) ? close : new TimeOnly(17, 0),
    };
}
