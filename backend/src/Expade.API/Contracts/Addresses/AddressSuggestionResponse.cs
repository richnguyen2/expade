namespace Expade.API.Contracts.Addresses;

public record AddressSuggestionResponse(
    string FormattedAddress,
    double Lat,
    double Lon,
    string? TimeZoneId
);
