using System.Text.Json;
using Svix;
using System.Net;
using Expade.Infrastructure;
using Expade.Core.Entities;
using Expade.Core.Enums;

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
                    if (string.IsNullOrEmpty(id)) return Results.BadRequest("Webhook payload missing user id.");

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
                else if (eventType == "user.updated")
                {
                    var data = root.GetProperty("data");
                    var id = data.GetProperty("id").GetString();

                    var existing = db.Users.FirstOrDefault(u => u.ExternalId == id);
                    if (existing != null)
                    {
                        // Keep the local role in sync with Clerk's public_metadata.role.
                        // Clerk is where roles (incl. Admin) are granted, so mirroring it here
                        // keeps the DB the source of truth for role guards across the API.
                        if (data.TryGetProperty("public_metadata", out var meta)
                            && meta.ValueKind == JsonValueKind.Object
                            && meta.TryGetProperty("role", out var roleProp)
                            && roleProp.ValueKind == JsonValueKind.String
                            && Enum.TryParse<UserRole>(roleProp.GetString(), out var role))
                        {
                            existing.Role = role;
                        }

                        // Keep email in sync as well.
                        if (data.TryGetProperty("email_addresses", out var emails) && emails.GetArrayLength() > 0)
                        {
                            existing.Email = emails[0].GetProperty("email_address").GetString() ?? existing.Email;
                        }

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