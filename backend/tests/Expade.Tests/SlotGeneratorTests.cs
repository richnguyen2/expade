using Expade.Core.Entities;
using Expade.Core.Services;

namespace Expade.Tests;

public class SlotGeneratorTests
{
    private static readonly DateOnly SummerDate = new(2026, 7, 15);  // EDT (UTC-4)
    private static readonly DateOnly WinterDate = new(2026, 1, 15);  // EST (UTC-5)

    private static BusinessHours Hours(int openHour, int closeHour, DayOfWeek day, bool isOpen = true) =>
        new()
        {
            DayOfWeek = day,
            IsOpen = isOpen,
            OpenTime = new TimeOnly(openHour, 0),
            CloseTime = new TimeOnly(closeHour, 0),
        };

    private static Appointment Appt(DateOnly date, int hourUtc, int durationMinutes) => new()
    {
        StartDateTime = new DateTimeOffset(date.ToDateTime(new TimeOnly(hourUtc, 0)), TimeSpan.Zero),
        Service = new Service { DurationInMinutes = durationMinutes },
    };

    private static BlockedTime Block(DateOnly date, int startHourUtc, int endHourUtc) => new()
    {
        StartDateTime = new DateTimeOffset(date.ToDateTime(new TimeOnly(startHourUtc, 0)), TimeSpan.Zero),
        EndDateTime = new DateTimeOffset(date.ToDateTime(new TimeOnly(endHourUtc, 0)), TimeSpan.Zero),
    };

    [Fact]
    public void Generate_ClosedDay_ReturnsEmpty()
    {
        var hours = Hours(9, 17, SummerDate.DayOfWeek, isOpen: false);
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], [], DateTimeOffset.MinValue, "UTC");
        Assert.Empty(slots);
    }

    [Fact]
    public void Generate_NullHours_ReturnsEmpty()
    {
        var slots = SlotGenerator.Generate(null, 60, SummerDate, [], [], DateTimeOffset.MinValue, "UTC");
        Assert.Empty(slots);
    }

    [Fact]
    public void Generate_StepsByDuration_WithinOpenHours()
    {
        var hours = Hours(9, 12, SummerDate.DayOfWeek); // 3-hour window
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], [], DateTimeOffset.MinValue, "UTC");
        Assert.Equal(3, slots.Count); // 9:00, 10:00, 11:00 (11+60 <= 12)
    }

    [Fact]
    public void Generate_AlwaysReturnsUtcInstants()
    {
        // Guards the Npgsql 'timestamp with time zone' constraint (offset must be zero).
        var hours = Hours(9, 17, SummerDate.DayOfWeek);
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], [], DateTimeOffset.MinValue, "America/New_York");
        Assert.NotEmpty(slots);
        Assert.All(slots, s => Assert.Equal(TimeSpan.Zero, s.Offset));
    }

    [Fact]
    public void Generate_AppliesBusinessTimezone_SummerDst()
    {
        var hours = Hours(9, 17, SummerDate.DayOfWeek);
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], [], DateTimeOffset.MinValue, "America/New_York");
        Assert.Equal(13, slots[0].UtcDateTime.Hour); // 9 AM EDT == 13:00 UTC
    }

    [Fact]
    public void Generate_AppliesBusinessTimezone_WinterStandard()
    {
        var hours = Hours(9, 17, WinterDate.DayOfWeek);
        var slots = SlotGenerator.Generate(hours, 60, WinterDate, [], [], DateTimeOffset.MinValue, "America/New_York");
        Assert.Equal(14, slots[0].UtcDateTime.Hour); // 9 AM EST == 14:00 UTC
    }

    [Fact]
    public void Generate_ExcludesSlotsOverlappingAppointments()
    {
        var hours = Hours(9, 12, SummerDate.DayOfWeek);
        var existing = new[] { Appt(SummerDate, 10, 60) }; // 10:00–11:00
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, existing, [], DateTimeOffset.MinValue, "UTC");

        Assert.Equal(2, slots.Count); // 9:00 and 11:00 survive
        Assert.DoesNotContain(slots, s => s.UtcDateTime.Hour == 10);
    }

    [Fact]
    public void Generate_ExcludesSlotsOverlappingBlockedTimes()
    {
        var hours = Hours(9, 12, SummerDate.DayOfWeek);
        var blocked = new[] { Block(SummerDate, 10, 11) };
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], blocked, DateTimeOffset.MinValue, "UTC");

        Assert.Equal(2, slots.Count);
        Assert.DoesNotContain(slots, s => s.UtcDateTime.Hour == 10);
    }

    [Fact]
    public void Generate_DropsPastSlots()
    {
        var hours = Hours(9, 12, SummerDate.DayOfWeek);
        var now = new DateTimeOffset(SummerDate.ToDateTime(new TimeOnly(10, 30)), TimeSpan.Zero);
        var slots = SlotGenerator.Generate(hours, 60, SummerDate, [], [], now, "UTC");

        Assert.Single(slots); // only 11:00 is in the future
        Assert.Equal(11, slots[0].UtcDateTime.Hour);
    }
}
