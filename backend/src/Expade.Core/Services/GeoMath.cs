namespace Expade.Core.Services;

/// <summary>Pure geographic helpers. No I/O, no state.</summary>
public static class GeoMath
{
    private const double EarthRadiusMiles = 3958.8;

    /// <summary>Great-circle distance between two lat/lon points, in miles (Haversine).</summary>
    public static double DistanceMiles(double lat1, double lon1, double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        return EarthRadiusMiles * 2 * Math.Asin(Math.Min(1, Math.Sqrt(a)));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
}
