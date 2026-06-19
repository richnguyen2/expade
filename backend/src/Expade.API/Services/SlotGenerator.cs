using Expade.Core.Entities;

namespace Expade.API.Services;

public static class SlotGenerator
{
    /// <summary>
    /// Generate bookable slot start times for a date, stepping by the service duration within the
    /// day's open hours, excluding times that overlap existing appointments.
    /// Open/close are interpreted as wall-clock time in the business's timezone, then converted to
    /// absolute instants (<see cref="DateTimeOffset"/>) so storage and comparisons are unambiguous.
    /// </summary>
    public static List<DateTimeOffset> Generate(
        BusinessHours? dayHours,
        int serviceDurationMinutes,
        DateOnly date,
        IEnumerable<Appointment> existing,
        DateTimeOffset now,
        string timeZoneId)
    {
        var slots = new List<DateTimeOffset>();
        if (dayHours is null || !dayHours.IsOpen || dayHours.CloseTime <= dayHours.OpenTime)
            return slots;

        var tz = ResolveTimeZone(timeZoneId);
        var duration = serviceDurationMinutes > 0 ? serviceDurationMinutes : 30;

        var open = ToInstant(date, dayHours.OpenTime, tz);
        var close = ToInstant(date, dayHours.CloseTime, tz);

        var busy = existing.Select(a =>
        {
            var dur = a.Service is { DurationInMinutes: > 0 } ? a.Service.DurationInMinutes : 30;
            return (Start: a.StartDateTime, End: a.StartDateTime.AddMinutes(dur));
        }).ToList();

        for (var slot = open; slot.AddMinutes(duration) <= close; slot = slot.AddMinutes(duration))
        {
            if (slot < now) continue; // no past slots (DateTimeOffset compares absolute instants)
            var slotEnd = slot.AddMinutes(duration);
            var conflict = busy.Any(b => slot < b.End && b.Start < slotEnd);
            if (!conflict) slots.Add(slot);
        }

        return slots;
    }

    /// <summary>Build an absolute instant from a wall-clock date+time in the given zone (DST-aware).</summary>
    private static DateTimeOffset ToInstant(DateOnly date, TimeOnly time, TimeZoneInfo tz)
    {
        var local = date.ToDateTime(time); // DateTimeKind.Unspecified — a wall-clock reading
        var offset = tz.GetUtcOffset(local);
        return new DateTimeOffset(local, offset);
    }

    /// <summary>Resolve an IANA id (falls back to UTC if the host can't find it).</summary>
    public static TimeZoneInfo ResolveTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId)) return TimeZoneInfo.Utc;
        try { return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); }
        catch { return TimeZoneInfo.Utc; }
    }

    /// <summary>The calendar date an instant falls on in the business's timezone.</summary>
    public static DateOnly LocalDateFor(DateTimeOffset instant, string? timeZoneId)
    {
        var tz = ResolveTimeZone(timeZoneId);
        return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(instant, tz).DateTime);
    }
}
