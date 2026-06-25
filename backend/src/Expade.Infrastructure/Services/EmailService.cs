using System.Net.Http.Headers;
using System.Net.Http.Json;
using Expade.Core.Interfaces;
using Microsoft.Extensions.Configuration;
namespace Expade.Infrastructure.Services;
public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _fromAddress;
    private readonly string _frontendBaseUrl;

    public EmailService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["Resend:ApiKey"]!;
        _fromAddress = config["Resend:FromAddress"] ?? "Expade <onboarding@resend.dev>";
        _frontendBaseUrl = config["Frontend:BaseUrl"] ?? "http://localhost:3000";
    }

    public async Task SendBusinessRequestConfirmationEmailAsync(string toEmail, string userName,string businessName)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = _fromAddress,
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
            from = _fromAddress,
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

        var onboardLink = $"{_frontendBaseUrl}/onboard/{requestId}";

        var payload = new
        {
            from = _fromAddress,
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
            from = _fromAddress,
            to = new[] { toEmail },
            subject = "Business Launched On Expade",
            html = $"<p>Hi <strong>{userName}</strong>,</p><p>Congratulations on launching <strong>{businessName}</strong> on Expade!</p>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }

    public async Task SendNewAppointmentEmailAsync(string toEmail, string staffName, string clientName, string serviceName, string whenFormatted)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var appointmentsLink = $"{_frontendBaseUrl}/my-businesses";

        var payload = new
        {
            from = _fromAddress,
            to = new[] { toEmail },
            subject = $"New booking request: {serviceName}",
            html = $@"
                <div style='font-family: sans-serif; color: #333;'>
                    <p>Hi <strong>{staffName}</strong>,</p>
                    <p><strong>{clientName}</strong> has requested an appointment for <strong>{serviceName}</strong>.</p>
                    <p><strong>When:</strong> {whenFormatted}</p>
                    <p>Open your dashboard to accept or decline this request.</p>
                    <a href='{appointmentsLink}' style='display: inline-block; padding: 12px 24px; background-color: #708238; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;'>
                        View in dashboard
                    </a>
                </div>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }

    public async Task SendAppointmentConfirmedEmailAsync(string toEmail, string clientName, string businessName, string serviceName, string whenFormatted)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var appointmentsLink = $"{_frontendBaseUrl}/appointments";

        var payload = new
        {
            from = _fromAddress,
            to = new[] { toEmail },
            subject = $"Your appointment is confirmed — {serviceName}",
            html = $@"
                <div style='font-family: sans-serif; color: #333;'>
                    <p>Hi <strong>{clientName}</strong>,</p>
                    <p>Good news! <strong>{businessName}</strong> has confirmed your appointment for <strong>{serviceName}</strong>.</p>
                    <p><strong>When:</strong> {whenFormatted}</p>
                    <a href='{appointmentsLink}' style='display: inline-block; padding: 12px 24px; background-color: #708238; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;'>
                        View my appointments
                    </a>
                </div>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }

    public async Task SendAppointmentCancelledEmailAsync(string toEmail, string clientName, string businessName, string serviceName, string whenFormatted)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        var payload = new
        {
            from = _fromAddress,
            to = new[] { toEmail },
            subject = $"Your appointment was cancelled — {serviceName}",
            html = $@"
                <div style='font-family: sans-serif; color: #333;'>
                    <p>Hi <strong>{clientName}</strong>,</p>
                    <p>We're sorry to let you know that <strong>{businessName}</strong> is no longer on Expade, so your appointment for <strong>{serviceName}</strong> has been cancelled.</p>
                    <p><strong>Was scheduled for:</strong> {whenFormatted}</p>
                    <p>You don't need to do anything. We apologize for any inconvenience.</p>
                </div>"
        };

        request.Content = JsonContent.Create(payload);
        await _httpClient.SendAsync(request);
    }
}