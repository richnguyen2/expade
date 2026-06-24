using Expade.API.Extensions;
using Expade.Core.Entities;
using Expade.Core.Interfaces;

namespace Expade.API.Middleware;

/// <summary>
/// Just-in-time user provisioning: on an authenticated request, if the caller has no DB row yet,
/// mirror them from Clerk and create one. Makes the app self-healing if a webhook was missed or the
/// DB was reset — the Clerk webhook then just keeps the row fresh, rather than being the only creator.
/// </summary>
public class EnsureUserMiddleware
{
    private readonly RequestDelegate _next;

    public EnsureUserMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IUserRepository users, IClerkService clerk)
    {
        var clerkId = context.User.GetClerkId();

        if (!string.IsNullOrEmpty(clerkId) && await users.GetByExternalIdAsync(clerkId) is null)
        {
            try
            {
                var info = await clerk.GetUserAsync(clerkId);
                if (info is not null)
                {
                    await users.AddAsync(new User
                    {
                        ExternalId = clerkId,
                        Email = info.Email,
                        Username = info.Username,
                        Role = info.Role,
                    });
                }
            }
            catch
            {
                // Never block the request on provisioning — a concurrent request may have created the
                // row, or Clerk may be briefly unavailable. Downstream handles a still-missing user.
            }
        }

        await _next(context);
    }
}
