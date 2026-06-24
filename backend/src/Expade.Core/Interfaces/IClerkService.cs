using Expade.Core.Enums;

namespace Expade.Core.Interfaces;

/// <summary>A Clerk user's mirrored fields, fetched from the Clerk Backend API.</summary>
public record ClerkUserInfo(string Email, string Username, UserRole Role);

/// <summary>Abstraction over the Clerk management API for syncing user metadata.</summary>
public interface IClerkService
{
    /// <summary>
    /// Set the user's role in Clerk `public_metadata` (mirrors the DB role).
    /// <paramref name="clerkUserId"/> is the Clerk user id (our <c>User.ExternalId</c>), not the internal Guid.
    /// </summary>
    Task SetUserRoleAsync(string clerkUserId, string role);

    /// <summary>Fetch a user from Clerk by id (for just-in-time provisioning); null if not found/unavailable.</summary>
    Task<ClerkUserInfo?> GetUserAsync(string clerkUserId);
}
