using System.Net.Http.Headers;
using System.Net.Http.Json;
using Expade.Core.Interfaces;
using Microsoft.Extensions.Configuration;
namespace Expade.Infrastructure.Services;
public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public EmailService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["Resend:ApiKey"]!;
    }

    public async Task SendBusinessRequestConfirmationEmailAsync(string toEmail, string userName,string businessName)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = "Expade <onboarding@resend.dev>",
            to = new[] { toEmail },
            subject = "Business Request Received",
            html = $"<p>Hi <strong>{userName}</strong>,</p><p>We have successfully received your business request for <strong>{businessName}</strong>. We'll get back to you shortly!</p>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }
}