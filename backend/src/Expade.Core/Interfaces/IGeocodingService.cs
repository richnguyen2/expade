namespace Expade.Core.Interfaces;

/// <summary>Result of geocoding an address: coordinates plus the IANA timezone the address falls in.</summary>
public record GeocodeResult(double Lat, double Lon, string? TimeZoneId);

public interface IGeocodingService
{
    Task<GeocodeResult?> GetCoordinatesAsync(string address);
}
