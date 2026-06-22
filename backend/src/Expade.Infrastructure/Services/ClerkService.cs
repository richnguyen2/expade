using System.Net.Http.Json;
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
}
