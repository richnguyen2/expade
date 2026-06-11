using System.Net.Http.Json;
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

    public async Task<(double Lat, double Lon)?> GetCoordinatesAsync(string address)
    {
        var url = $"https://api.opencagedata.com/geocode/v1/json?q={Uri.EscapeDataString(address)}&key={_apiKey}";
        var response = await _httpClient.GetFromJsonAsync<OpenCageResponse>(url);
        
        var result = response?.Results?.FirstOrDefault();
        if (result == null) return null;

        return (result.Geometry.Lat, result.Geometry.Lng);
    }
}

public record OpenCageResponse(List<OpenCageResult> Results);
public record OpenCageResult(OpenCageGeometry Geometry);
public record OpenCageGeometry(double Lat, double Lng);