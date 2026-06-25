using Expade.Core.Services;

namespace Expade.Tests;

public class GeoMathTests
{
    [Fact]
    public void DistanceMiles_SamePoint_IsZero()
    {
        Assert.Equal(0, GeoMath.DistanceMiles(40.0, -75.0, 40.0, -75.0), precision: 6);
    }

    [Fact]
    public void DistanceMiles_KnownCities_IsApproximatelyCorrect()
    {
        // NYC -> Philadelphia is ~80 miles.
        var d = GeoMath.DistanceMiles(40.7128, -74.0060, 39.9526, -75.1652);
        Assert.InRange(d, 78, 83);
    }

    [Fact]
    public void DistanceMiles_OneDegreeLatitude_IsAboutSixtyNineMiles()
    {
        var d = GeoMath.DistanceMiles(40.0, -75.0, 41.0, -75.0);
        Assert.InRange(d, 68, 70);
    }
}
