namespace Expade.Core.Interfaces;

/// <summary>Result of geocoding an address: coordinates plus the IANA timezone the address falls in.</summary>
public record GeocodeResult(double Lat, double Lon, string? TimeZoneId);

/// <summary>A selectable address suggestion (validated, geocodable) for the autocomplete UI.</summary>
public record AddressSuggestion(string FormattedAddress, double Lat, double Lon, string? TimeZoneId);

public interface IGeocodingService
{
    Task<GeocodeResult?> GetCoordinatesAsync(string address);

    /// <summary>Search for matching addresses (on-demand autocomplete). Returns up to <paramref name="limit"/> results.</summary>
    Task<IReadOnlyList<AddressSuggestion>> SearchAsync(string query, int limit = 5);
}
