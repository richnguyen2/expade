using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.BusinessesRequests;
using Expade.Core.Enums;
using System.Security.Claims;
using Expade.Infrastructure;
namespace Expade.API.Endpoints;

public static class BusinessRequestEndpoints
{
    public static void MapBusinessRequestEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/business-requests").WithTags("BusinessRequests");

        group.MapGet("/", async (IBusinessRequestRepository repository, [AsParameters] RequestFilter filter) =>
        {
            var requests = await repository.GetAllAsync(filter.Status);
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

        group.MapPatch("/{id:guid}/status", async (Guid id, UpdateBusinessRequestStatusRequest request, IBusinessRequestRepository repository, IUserRepository userRepository, IConfiguration config, HttpClient httpClient) =>
        {
            var existingRequest = await repository.GetByIdAsync(id);
            if (existingRequest == null) return Results.NotFound();

            existingRequest.Status = request.Status;

            await repository.UpdateAsync(existingRequest);
            if (request.Status == RequestStatus.Approved)
            {
                var user = await userRepository.GetByIdAsync(existingRequest.UserId);
                if (user == null) return Results.NotFound("User not found for this request.");

                // Update User role in your local DB
                if (user.Role != UserRole.Admin)
                {
                    user.Role = UserRole.BusinessOwner;
                    await userRepository.UpdateAsync(user);

                    // 3. Sync with Clerk
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
            }

            return Results.NoContent();
        }).RequireAuthorization("AdminOnly");

    }
}
public record RequestFilter(RequestStatus? Status);