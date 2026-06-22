using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Expade.Core.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Expade.Infrastructure.Services;

public class OpenCageGeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public OpenCageGeocodingService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["OpenCageApiKey"]!;
    }

    public async Task<GeocodeResult?> GetCoordinatesAsync(string address)
    {
        var url = $"https://api.opencagedata.com/geocode/v1/json?q={Uri.EscapeDataString(address)}&key={_apiKey}";
        var response = await _httpClient.GetFromJsonAsync<OpenCageResponse>(url);

        var result = response?.Results?.FirstOrDefault();
        if (result == null) return null;

        // OpenCage returns the IANA timezone in annotations.timezone.name (e.g. "America/Chicago").
        var timeZoneId = result.Annotations?.Timezone?.Name;

        return new GeocodeResult(result.Geometry.Lat, result.Geometry.Lng, timeZoneId);
    }

    public async Task<IReadOnlyList<AddressSuggestion>> SearchAsync(string query, int limit = 5)
    {
        // OpenCage recommends against per-keystroke use; this is called on-demand (search button / blur).
        var url = $"https://api.opencagedata.com/geocode/v1/json?q={Uri.EscapeDataString(query)}" +
                  $"&key={_apiKey}&limit={limit}&abbrv=1&no_record=1";
        var response = await _httpClient.GetFromJsonAsync<OpenCageResponse>(url);

        var results = response?.Results;
        if (results is null) return Array.Empty<AddressSuggestion>();

        return results
            .Where(r => !string.IsNullOrWhiteSpace(r.Formatted))
            .Select(r => new AddressSuggestion(
                r.Formatted!,
                r.Geometry.Lat,
                r.Geometry.Lng,
                r.Annotations?.Timezone?.Name))
            .ToList();
    }
}

public record OpenCageResponse(List<OpenCageResult> Results);
public record OpenCageResult(
    OpenCageGeometry Geometry,
    OpenCageAnnotations? Annotations,
    [property: JsonPropertyName("formatted")] string? Formatted);
public record OpenCageGeometry(double Lat, double Lng);
public record OpenCageAnnotations([property: JsonPropertyName("timezone")] OpenCageTimezone? Timezone);
public record OpenCageTimezone([property: JsonPropertyName("name")] string? Name);
