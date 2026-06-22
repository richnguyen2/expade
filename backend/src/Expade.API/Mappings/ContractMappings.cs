using Expade.API.Contracts.Addresses;
using Expade.API.Contracts.Appointments.Responses;
using Expade.API.Contracts.Businesses.Responses;
using Expade.API.Contracts.BusinessRequests.Responses;
using Expade.Core.Entities;
using Expade.Core.Interfaces;

namespace Expade.API.Mappings;

/// <summary>
/// Centralized entity -> response DTO mapping so endpoints never hand-map inline
/// and never leak EF entities over the wire. Mapping to wire contracts is a
/// presentation concern and lives in the API layer (the contracts live here too);
/// the Tier 5 application/service layer works with entities and consumes these at the edge.
/// </summary>
public static class ContractMappings
{
    public static ServiceResponse ToResponse(this Service s) =>
        new(s.Id, s.Name, s.Description, s.Price, s.DurationInMinutes);

    public static WorkerResponse ToResponse(this Worker w) =>
        new(w.Id, w.Email, w.JobTitle, w.Role.ToString());

    public static BusinessResponse ToResponse(this Business b) =>
        new(
            b.Id,
            b.Name,
            b.Description,
            b.Phone,
            b.Address,
            b.Category?.Name ?? "Unknown",
            b.TimeZoneId,
            b.Services.Select(s => s.ToResponse()).ToList(),
            b.Workers.Select(w => w.ToResponse()).ToList()
        );

    /// <summary>Public discovery card projection.</summary>
    public static BusinessListItemResponse ToListItemResponse(this Business b) =>
        new(b.Id, b.Name, b.Description, b.CategoryId, b.Category?.Name ?? "Unknown", b.Address, b.Phone);

    /// <summary>My-Businesses projection; Role is the requesting user's role at this business.</summary>
    public static BusinessSummaryResponse ToSummaryResponse(this Business b, Guid userId) =>
        new(
            b.Id,
            b.Name,
            b.Category?.Name ?? "General",
            b.Workers.FirstOrDefault(w => w.UserId == userId)?.Role.ToString() ?? "Employee"
        );

    public static BusinessRequestResponse ToResponse(this BusinessRequest r) =>
        new(r.Id, r.Name, r.Phone, r.Address, r.Category?.Name ?? "Unknown", r.Status, r.CreatedAt);

    public static BusinessRequestOnboardResponse ToOnboardResponse(this BusinessRequest r) =>
        new(r.Id, r.Name, r.Phone, r.Address, r.CategoryId, r.Category?.Name ?? "Unknown");

    public static BusinessHoursResponse ToResponse(this BusinessHours h) =>
        new((int)h.DayOfWeek, h.IsOpen, h.OpenTime.ToString("HH:mm"), h.CloseTime.ToString("HH:mm"));

    public static BlockedTimeResponse ToResponse(this BlockedTime bt) =>
        new(bt.Id, bt.StartDateTime, bt.EndDateTime, bt.Reason);

    public static AddressSuggestionResponse ToResponse(this AddressSuggestion s) =>
        new(s.FormattedAddress, s.Lat, s.Lon, s.TimeZoneId);

    public static AppointmentResponse ToResponse(this Appointment a) =>
        new(
            a.Id,
            a.Service.BusinessId,
            a.Service.Business?.Name ?? "Unknown",
            a.Service.Name,
            a.Service.Price,
            a.Service.DurationInMinutes,
            a.Worker?.User?.Username ?? a.Worker?.JobTitle ?? "Staff",
            a.Client?.Username ?? "Customer",
            a.StartDateTime,
            a.Service.Business?.TimeZoneId ?? "America/New_York",
            a.Status.ToString()
        );
}
