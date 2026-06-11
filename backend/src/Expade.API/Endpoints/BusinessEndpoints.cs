using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.Businesses;
using System.Security.Claims;
using Expade.Infrastructure;
using Expade.Core.Enums;

namespace Expade.API.Endpoints;

public static class BusinessEndpoints
{
    public static void MapBusinessEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/businesses").WithTags("Businesses");

        group.MapGet("/", async (IBusinessRepository repository) =>
        {
            var businesses = await repository.GetAllAsync();
            return Results.Ok(businesses);
        }).RequireAuthorization();

        group.MapPost("/create-from-request", async (
             ClaimsPrincipal userPrincipal,
             CreateBusinessFromRequest contract,
             IUserRepository userRepository,
             IBusinessRequestRepository businessRequestRepository,
             IBusinessRepository businessRepository,
             IEmailService emailService) =>
         {
             var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
             if (string.IsNullOrEmpty(clerkId)) return Results.Unauthorized();

             var user = await userRepository.GetByExternalIdAsync(clerkId);
             if (user == null) return Results.NotFound("User profile not found.");

             // 2. Fetch and validate the original Business Request
             var request = await businessRequestRepository.GetByIdAsync(contract.RequestId);
             if (request == null) return Results.NotFound("Associated business request not found.");
             if (request.UserId != user.Id) return Results.Forbid();
             if (request.Status != RequestStatus.Approved) return Results.BadRequest("Request must be approved to onboard.");

             // 3. Guard against duplicate onboarding submissions using the updated repository
             var alreadyExists = await businessRepository.ExistsByRequestIdAsync(request.Id);
             if (alreadyExists) return Results.BadRequest("A business has already been created from this request.");

             try
             {
                 var newBusiness = new Business
                 {
                     Name = request.Name,
                     Phone = request.Phone,
                     Address = request.Address,
                     Latitude = request.Latitude,
                     Longitude = request.Longitude,
                     CategoryId = request.CategoryId,
                     Description = contract.Description,
                     RequestId = request.Id
                 };

                 // 5. EF Core Magic: Populate child collections directly on the object graph

                 // Automatically add the owner as the Manager
                 newBusiness.Workers.Add(new Worker
                 {
                     UserId = user.Id,
                     Email = user.Email,
                     Role = WorkerRole.Manager
                 });

                 // Add the custom onboarding Services
                 foreach (var serviceItem in contract.Services)
                 {
                     newBusiness.Services.Add(new Service
                     {
                         Name = serviceItem.Name,
                         Description = serviceItem.Description
                     });
                 }

                 // TODO: Process optional staff team members
                 foreach (var workerItem in contract.Workers)
                 {
                     var existingStaffUser = await userRepository.GetByEmailAsync(workerItem.Email);
                     // NEW VALIDATION: Fail fast if the user doesn't exist
                     if (existingStaffUser == null)
                     {
                         return Results.BadRequest($"Cannot add staff: No user found with the email '{workerItem.Email}'. They must create an account first.");
                     }

                     newBusiness.Workers.Add(new Worker
                     {
                         // We now know for a fact existingStaffUser is not null
                         UserId = existingStaffUser.Id,
                         Email = workerItem.Email,
                         Role = WorkerRole.Employee
                     });
                 }

                 // 6. Save parent graph via repository 
                 // This automatically handles the database transaction and inserts child dependencies
                 await businessRepository.AddAsync(newBusiness);

                 _ = emailService.SendBusinessLaunchedEmailAsync(user.Email, user.Username, request.Name);

                 return Results.Ok(new { businessId = newBusiness.Id, message = "Business launched successfully!" });
             }
             catch (Exception ex)
             {
                 return Results.Problem($"Onboarding failed: {ex.Message}");
             }
         })
         .RequireAuthorization();
    }
}