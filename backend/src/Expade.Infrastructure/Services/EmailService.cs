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

    public async Task SendBusinessRequestRejectionEmailAsync(string toEmail, string userName, string businessName)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = "Expade <onboarding@resend.dev>",
            to = new[] { toEmail },
            subject = "Business Request Rejected",
            html = $"<p>Hi <strong>{userName}</strong>,</p><p>We're sorry to inform you that your business request for <strong>{businessName}</strong> has been rejected.</p>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }

    public async Task SendBusinessRequestApprovedEmailAsync(string toEmail, string userName, string businessName, Guid requestId)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        // The frontend route for now, will change when deployed.
        var onboardLink = $"http://localhost:3000/onboard/{requestId}";

        var payload = new
        {
            from = "Expade <onboarding@resend.dev>",
            to = new[] { toEmail },
            subject = "Action Required: Complete Your Expade Business Setup",
            html = $@"
                <div style='font-family: sans-serif; color: #333;'>
                    <p>Hi <strong>{userName}</strong>,</p>
                    <p>Congratulations! Your business request for <strong>{businessName}</strong> has been approved.</p>
                    <p>You are just one step away from getting your business listed on Expade.</p>
                    <a href='{onboardLink}' style='display: inline-block; padding: 12px 24px; background-color: #708238; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;'>
                        Complete Business Setup
                    </a>
                </div>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }
    public async Task SendBusinessLaunchedEmailAsync(string toEmail, string userName,string businessName)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = "Expade <onboarding@resend.dev>",
            to = new[] { toEmail },
            subject = "Business Laucnhed On Expade",
            html = $"<p>Hi <strong>{userName}</strong>,</p><p>Congratulations on luanching <strong>{businessName}</strong> on Expade!</p>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }
}