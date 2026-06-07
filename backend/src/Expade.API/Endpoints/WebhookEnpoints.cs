using System.Text.Json;
using Svix;
using System.Net;
using Expade.Infrastructure;
using Expade.Core.Entities;

namespace Expade.API.Endpoints;

public static class WebhookEndpoints
{
    public static void MapWebhookEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/webhooks/clerk", async (HttpContext context, AppDbContext db, IConfiguration config) =>
        {
            var secret = config["Clerk:WebhookSecret"];
            if (string.IsNullOrEmpty(secret))
            {
                return Results.Problem("Clerk WebhookSecret is not configured.");
            }

            var svixId = context.Request.Headers["svix-id"];
            var svixTimestamp = context.Request.Headers["svix-timestamp"];
            var svixSignature = context.Request.Headers["svix-signature"];

            if (string.IsNullOrEmpty(svixId) || string.IsNullOrEmpty(svixTimestamp) || string.IsNullOrEmpty(svixSignature))
            {
                return Results.BadRequest("Missing required Svix headers.");
            }

            using var reader = new StreamReader(context.Request.Body);
            var jsonBody = await reader.ReadToEndAsync(); // Read the raw JSON string

            try
            {
                var wh = new Webhook(secret);

                var headers = new WebHeaderCollection
                {
                    { "svix-id", svixId! },
                    { "svix-timestamp", svixTimestamp! },
                    { "svix-signature", svixSignature! }
                };

                wh.Verify(jsonBody, headers);

                using var jsonDoc = JsonDocument.Parse(jsonBody);
                var root = jsonDoc.RootElement;
                
                var eventType = root.GetProperty("type").GetString();

                if (eventType == "user.created")
                {
                    var data = root.GetProperty("data");
                    var id = data.GetProperty("id").GetString();

                    string email = "test@example.com"; // Default for test payloads
                    if (data.TryGetProperty("email_addresses", out var emails) && emails.GetArrayLength() > 0)
                    {
                        email = emails[0].GetProperty("email_address").GetString() ?? email;
                    }

                    // SAFE USERNAME EXTRACTION
                    string username = $"user_{id[^4..]}"; // Default fallback
                    if (data.TryGetProperty("username", out var uName) && uName.ValueKind != JsonValueKind.Null)
                    {
                        username = uName.GetString() ?? username;
                    }

                    var userExists = db.Users.Any(u => u.ExternalId == id);
                    if (!userExists)
                    {
                        var newUser = new User 
                        { 
                            ExternalId = id!, 
                            Email = email!, 
                            Username = username!,
                            Role = UserRole.User 
                        };

                        db.Users.Add(newUser);
                        await db.SaveChangesAsync();
                    }
                }

                return Results.Ok();
            }
            catch (Exception ex)
            {
                // Verification failed (or JSON parsing failed)
                return Results.BadRequest($"Webhook Error: {ex.Message}");
            }
        });
    }
}