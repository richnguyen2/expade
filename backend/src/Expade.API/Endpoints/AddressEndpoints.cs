using Expade.API.Contracts.Addresses;
using Expade.API.Mappings;
using Expade.Core.Interfaces;

namespace Expade.API.Endpoints;

public static class AddressEndpoints
{
    public const string SearchRateLimitPolicy = "address-search";

    public static void MapAddressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/addresses").WithTags("Addresses");

        // On-demand address search (autocomplete). Authenticated + rate-limited so the
        // OpenCage key (kept server-side) can't be drained by abuse.
        group.MapGet("/search", async (string q, IGeocodingService geocoding) =>
        {
            if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 5)
                return Results.Ok(Array.Empty<AddressSuggestionResponse>());

            var results = await geocoding.SearchAsync(q.Trim());
            return Results.Ok(results.Select(r => r.ToResponse()));
        })
        .RequireAuthorization()
        .RequireRateLimiting(SearchRateLimitPolicy);
    }
}
