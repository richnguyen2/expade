using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.BusinessesRequests;
using Expade.Core.Enums;
using System.Security.Claims;
using Expade.Infrastructure;
using Microsoft.EntityFrameworkCore;
namespace Expade.API.Endpoints;

public static class BusinessRequestEndpoints
{
    public static void MapBusinessRequestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/business-requests").WithTags("BusinessRequests");

        group.MapGet("/", async (IBusinessRequestRepository repository) =>
        {
            var requests = await repository.GetAllAsync();
            return Results.Ok(requests);
        }).RequireAuthorization("AdminOnly");

        group.MapPost("/", async (
            ClaimsPrincipal userPrincipal, 
            CreateBusinessRequestRequest request, 
            IBusinessRequestRepository repository, 
            IUserRepository userRepository, 
            IGeocodingService geoService, 
            IEmailService emailService,
            HttpContext http, 
            AppDbContext db) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

            // 2. Find the user in your DB by their ExternalId
            var user = await userRepository.GetByExternalIdAsync(clerkId);

            if (user == null) return Results.NotFound("User profile not found.");

            var coordinates = await geoService.GetCoordinatesAsync(request.Address);
            if (coordinates == null)
            {
                return Results.BadRequest("Could not geocode the provided address.");
            }

            var newBusinessRequest = new BusinessRequest
            {
                Name = request.Name,
                CategoryId = request.CategoryId,
                Address = request.Address,
                Phone = request.Phone,
                Latitude = coordinates.Value.Lat,
                Longitude = coordinates.Value.Lon,
                UserId = user.Id,
            };

            await repository.AddAsync(newBusinessRequest);
            var email = user.Email;

            if (!string.IsNullOrEmpty(email))
            {
                _ = emailService.SendBusinessRequestConfirmationEmailAsync(email, user.Username, request.Name);
            }
            return Results.Created($"/business-requests/{newBusinessRequest.Id}", newBusinessRequest);
        }).RequireAuthorization();

        group.MapPatch("/{id:guid}/status", async (
            Guid id, 
            UpdateBusinessRequestStatusRequest request, 
            IBusinessRequestRepository repository, 
            IUserRepository userRepository, 
            IConfiguration config,
            IEmailService emailService, 
            HttpClient httpClient) =>
        {
            var existingRequest = await repository.GetByIdAsync(id);
            if (existingRequest == null) return Results.NotFound();

            existingRequest.Status = request.Status;
            var user = await userRepository.GetByIdAsync(existingRequest.UserId);
            if (user == null) return Results.NotFound("User not found for this request.");

            await repository.UpdateAsync(existingRequest);

            var email = user.Email;

            if (request.Status == RequestStatus.Approved)
            {
                 _ = emailService.SendBusinessRequestApprovedEmailAsync(email, user.Username, existingRequest.Name, existingRequest.Id);

                // Update User role in your local DB
                if (user.Role != UserRole.Admin)
                {
                    user.Role = UserRole.BusinessOwner;
                    await userRepository.UpdateAsync(user);

                    var clerkSecretKey = config["Clerk:SecretKey"];
                    var clerkUserId = user.Id.ToString(); // Ensure this matches Clerk's user ID format

                    var clerkPayload = new
                    {
                        public_metadata = new { role = nameof(UserRole.BusinessOwner) }
                    };

                    var requestMessage = new HttpRequestMessage(
                        HttpMethod.Patch,
                        $"https://api.clerk.com/v1/users/{clerkUserId}/metadata"
                    );

                    requestMessage.Headers.Add("Authorization", $"Bearer {clerkSecretKey}");
                    requestMessage.Content = JsonContent.Create(clerkPayload);

                    var response = await httpClient.SendAsync(requestMessage);

                    if (!response.IsSuccessStatusCode)
                    {
                        // Optional: Log this error. The status updated, but Clerk failed.
                        return Results.Problem("Status updated, but failed to promote user in Clerk.");
                    }
                }
            } else if (request.Status == RequestStatus.Rejected)
            {
                _ = emailService.SendBusinessRequestRejectionEmailAsync(email, user.Username, existingRequest.Name);
            }

            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");

        group.MapGet("/{id:guid}/onboarding-data", async (
            Guid id, 
            ClaimsPrincipal userPrincipal, 
            IUserRepository userRepository, 
            AppDbContext db) =>
        {
            // Get the Clerk User ID from the token
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

            // Find the user in your DB by their ExternalId
            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User profile not found.");

            // Fetch the business request and include the category for pre-filling
            var request = await db.BusinessRequests
                .Include(r => r.Category)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null) return Results.NotFound("Business request not found.");

            // Guard: Ensure the logged-in user actually owns this request
            if (request.UserId != user.Id) return Results.Forbid();

            // Guard: Ensure it's actually approved before letting them onboard
            if (request.Status != RequestStatus.Approved)
            {
                return Results.BadRequest("This business request has not been approved yet.");
            }

            // Return clean, camelCase matched data to map right into your React form
            return Results.Ok(new 
            {
                id = request.Id,
                name = request.Name,
                phone = request.Phone,
                address = request.Address,
                categoryId = request.CategoryId,
                categoryName = request.Category?.Name
            });
        }).RequireAuthorization();

    }
}
public record RequestFilter(RequestStatus? Status);