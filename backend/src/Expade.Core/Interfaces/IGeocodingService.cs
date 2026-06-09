namespace Expade.Core.Interfaces;

public interface IGeocodingService
{
    Task<(double Lat, double Lon)?> GetCoordinatesAsync(string address);
}