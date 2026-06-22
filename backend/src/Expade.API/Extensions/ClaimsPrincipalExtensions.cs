using System.Security.Claims;

namespace Expade.API.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>The Clerk user id (JWT NameIdentifier) — our <c>User.ExternalId</c>. Null if unauthenticated.</summary>
    public static string? GetClerkId(this ClaimsPrincipal principal) =>
        principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}
