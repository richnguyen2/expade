using System.Net.Http.Json;
using System.Text.Json;
using Expade.Core.Enums;
using Expade.Core.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Expade.Infrastructure.Services;

/// <summary>Talks to the Clerk Backend API to keep user metadata in sync with our DB.</summary>
public class ClerkService : IClerkService
{
    private readonly HttpClient _httpClient;
    private readonly string? _secretKey;

    public ClerkService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _secretKey = config["Clerk:SecretKey"];
    }

    public async Task SetUserRoleAsync(string clerkUserId, string role)
    {
        if (string.IsNullOrEmpty(clerkUserId))
            throw new ArgumentException("Clerk user id is required.", nameof(clerkUserId));

        var requestMessage = new HttpRequestMessage(
            HttpMethod.Patch,
            $"https://api.clerk.com/v1/users/{clerkUserId}/metadata");

        requestMessage.Headers.Add("Authorization", $"Bearer {_secretKey}");
        requestMessage.Content = JsonContent.Create(new { public_metadata = new { role } });

        var response = await _httpClient.SendAsync(requestMessage);
        response.EnsureSuccessStatusCode();
    }

    public async Task<ClerkUserInfo?> GetUserAsync(string clerkUserId)
    {
        if (string.IsNullOrEmpty(clerkUserId)) return null;

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.clerk.com/v1/users/{clerkUserId}");
        request.Headers.Add("Authorization", $"Bearer {_secretKey}");

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode) return null;

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var root = doc.RootElement;

        var email = "";
        if (root.TryGetProperty("email_addresses", out var emails) && emails.GetArrayLength() > 0)
            email = emails[0].GetProperty("email_address").GetString() ?? "";

        var username = root.TryGetProperty("username", out var u) && u.ValueKind == JsonValueKind.String
            ? u.GetString()!
            : (string.IsNullOrEmpty(email)
                ? $"user_{clerkUserId[^Math.Min(4, clerkUserId.Length)..]}"
                : email.Split('@')[0]);

        var role = UserRole.User;
        if (root.TryGetProperty("public_metadata", out var meta) && meta.ValueKind == JsonValueKind.Object
            && meta.TryGetProperty("role", out var roleProp) && roleProp.ValueKind == JsonValueKind.String
            && Enum.TryParse<UserRole>(roleProp.GetString(), out var parsed))
            role = parsed;

        return new ClerkUserInfo(email, username, role);
    }
}
