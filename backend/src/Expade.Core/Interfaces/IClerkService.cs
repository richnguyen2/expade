namespace Expade.Core.Interfaces;

/// <summary>Abstraction over the Clerk management API for syncing user metadata.</summary>
public interface IClerkService
{
    /// <summary>
    /// Set the user's role in Clerk `public_metadata` (mirrors the DB role).
    /// <paramref name="clerkUserId"/> is the Clerk user id (our <c>User.ExternalId</c>), not the internal Guid.
    /// </summary>
    Task SetUserRoleAsync(string clerkUserId, string role);
}
