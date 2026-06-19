using Expade.Core.Entities;
using Expade.Core.Interfaces;
using Expade.API.Contracts.Businesses.Requests;
using Expade.API.Contracts.Businesses.Responses;
using System.Security.Claims;
using Expade.Core.Enums;
using Expade.API.Mappings;
using Expade.API.Services;

namespace Expade.API.Endpoints;

public static class BusinessEndpoints
{
    public static void MapBusinessEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/businesses").WithTags("Businesses");

        group.MapGet("/", async (IBusinessRepository repository) =>
        {
            var businesses = await repository.GetAllAsync();
            return Results.Ok(businesses.Select(b => b.ToListItemResponse()));
        }).RequireAuthorization();

        group.MapGet("/{id:guid}", async (
            Guid id,
            IBusinessRepository businessRepository) =>
        {
            var business = await businessRepository.GetByIdAsync(id);

            if (business == null) return Results.NotFound();

            return Results.Ok(business.ToResponse());
        }).RequireAuthorization();

        group.MapGet("/my-businesses", async (
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IBusinessRepository businessRepository) =>
        {
            // 1. Get the Clerk ID from the JWT
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (clerkId == null) return Results.Unauthorized();

            // 2. Map Clerk ID to your internal User ID
            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User not found in system.");

            // 3. Fetch businesses using the optimized repository method
            var businesses = await businessRepository.GetBusinessesByUserIdAsync(user.Id);

            // 4. Map to Summary DTO
            var response = businesses.Select(b => b.ToSummaryResponse(user.Id));

            return Results.Ok(response);
        })
        .RequireAuthorization("Worker");

        group.MapPatch("/{id:guid}", async (
            Guid id,
            UpdateBusinessRequest request,
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IBusinessRepository businessRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (clerkId == null) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User not found.");

            var business = await businessRepository.GetByIdAsync(id);
            if (business == null) return Results.NotFound("Business not found.");

            var workerRecord = business.Workers.FirstOrDefault(w => w.UserId == user.Id);
            if (workerRecord == null)
            {
                return Results.Forbid();
            }

            if (workerRecord.Role == WorkerRole.Employee)
            {
                return Results.Forbid();
            }

            business.Phone = request.Phone;
            business.Description = request.Description;

            await businessRepository.UpdateAsync(business);

            return Results.Ok(new { message = "Settings updated successfully" });
        })
        .RequireAuthorization("Worker");

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
                     TimeZoneId = request.TimeZoneId,
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
                         Description = serviceItem.Description,
                         Price = serviceItem.Price,
                         DurationInMinutes = serviceItem.DurationInMinutes
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

                 // Weekly operating hours are set by the owner during onboarding (required),
                 // so a live business never displays defaulted/incorrect hours.
                 foreach (var h in contract.Hours)
                 {
                     newBusiness.Hours.Add(new BusinessHours
                     {
                         DayOfWeek = (DayOfWeek)h.DayOfWeek,
                         IsOpen = h.IsOpen,
                         OpenTime = TimeOnly.TryParse(h.Open, out var open) ? open : new TimeOnly(9, 0),
                         CloseTime = TimeOnly.TryParse(h.Close, out var close) ? close : new TimeOnly(17, 0)
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

        group.MapPost("/{id:guid}/services", async (
        Guid id,
        CreateServiceRequest request,
        ClaimsPrincipal userPrincipal,
        IUserRepository userRepository,
        IBusinessRepository businessRepository) =>
        {
            // 1. Authenticate and identify the user
        var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (clerkId == null) return Results.Unauthorized();

        var user = await userRepository.GetByExternalIdAsync(clerkId);
        if (user == null) return Results.NotFound("User not found.");

            // 2. Fetch the business
        var business = await businessRepository.GetByIdAsync(id);
        if (business == null) return Results.NotFound("Business not found.");

            // 3. Security Check: Ensure the user works at this business
        var workerRecord = business.Workers.FirstOrDefault(w => w.UserId == user.Id);
        if (workerRecord == null) return Results.Forbid();

            // 4. Create the new Entity
        var newService = new Service
        {
            Name = request.Name,
            Description = request.Description,
            BusinessId = business.Id,
            Price = request.Price
        };

            // 5. Add to the business and save
            // Note: This assumes your Business entity has: public ICollection<Service> Services { get; set; } = new List<Service>();
        await businessRepository.AddServiceAsync(newService);

        await businessRepository.SaveChangesAsync();

            // 6. Return the newly created service as a Response DTO
        return Results.Ok(newService.ToResponse());
        })
        .RequireAuthorization("BusinessOwnerOnly");

        group.MapDelete("/{id:guid}/services/{serviceId:guid}", async (
            Guid id,
            Guid serviceId,
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IBusinessRepository businessRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (clerkId == null) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User not found.");

            var business = await businessRepository.GetByIdAsync(id);
            if (business == null) return Results.NotFound("Business not found.");

            var workerRecord = business.Workers.FirstOrDefault(w => w.UserId == user.Id);
            if (workerRecord == null) return Results.Forbid(); 

            var serviceToRemove = business.Services.FirstOrDefault(s => s.Id == serviceId);
            if (serviceToRemove == null) return Results.NotFound("Service not found.");

            // USE THE NEW EXPLICIT METHOD HERE
            businessRepository.RemoveService(serviceToRemove);
            await businessRepository.SaveChangesAsync();

            return Results.NoContent();
        })
        .RequireAuthorization("BusinessOwnerOnly");

        group.MapPut("/{id:guid}/services/{serviceId:guid}", async (
            Guid id,
            Guid serviceId,
            UpdateServiceRequest request,
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IBusinessRepository businessRepository) =>
        {
            // 1. Authenticate user
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (clerkId == null) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User not found.");

            // 2. Fetch business & verify authorization
            var business = await businessRepository.GetByIdAsync(id);
            if (business == null) return Results.NotFound("Business not found.");

            var workerRecord = business.Workers.FirstOrDefault(w => w.UserId == user.Id);
            if (workerRecord == null) return Results.Forbid(); 

            // 3. Find the specific service
            var serviceToUpdate = business.Services.FirstOrDefault(s => s.Id == serviceId);
            if (serviceToUpdate == null) return Results.NotFound("Service not found.");

            // 4. Update the properties
            serviceToUpdate.Name = request.Name;
            serviceToUpdate.Description = request.Description;
            serviceToUpdate.Price = request.Price;
            serviceToUpdate.DurationInMinutes = request.DurationInMinutes;

            // 5. Save changes
            await businessRepository.SaveChangesAsync();

            // 6. Return the updated service as a Response DTO
            return Results.Ok(serviceToUpdate.ToResponse());
        })
        .RequireAuthorization("BusinessOwnerOnly");

        // ---- Weekly operating hours ----

        // GET hours — always returns all 7 days (missing days fall back to a closed default).
        group.MapGet("/{id:guid}/hours", async (Guid id, IBusinessRepository businessRepository) =>
        {
            var existing = (await businessRepository.GetHoursAsync(id)).ToDictionary(h => h.DayOfWeek);

            var week = Enumerable.Range(0, 7).Select(d =>
            {
                var day = (DayOfWeek)d;
                return existing.TryGetValue(day, out var h)
                    ? h.ToResponse()
                    : new BusinessHoursResponse(d, false, "09:00", "17:00");
            });

            return Results.Ok(week);
        }).RequireAuthorization();

        // PUT hours — managers only. Replaces the full week.
        group.MapPut("/{id:guid}/hours", async (
            Guid id,
            UpdateBusinessHoursRequest request,
            ClaimsPrincipal userPrincipal,
            IUserRepository userRepository,
            IBusinessRepository businessRepository) =>
        {
            var clerkId = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (clerkId == null) return Results.Unauthorized();

            var user = await userRepository.GetByExternalIdAsync(clerkId);
            if (user == null) return Results.NotFound("User not found.");

            var business = await businessRepository.GetByIdAsync(id);
            if (business == null) return Results.NotFound("Business not found.");

            var workerRecord = business.Workers.FirstOrDefault(w => w.UserId == user.Id);
            if (workerRecord == null || workerRecord.Role != WorkerRole.Manager) return Results.Forbid();

            var hours = request.Hours.Select(h => new BusinessHours
            {
                DayOfWeek = (DayOfWeek)h.DayOfWeek,
                IsOpen = h.IsOpen,
                OpenTime = TimeOnly.TryParse(h.Open, out var open) ? open : new TimeOnly(9, 0),
                CloseTime = TimeOnly.TryParse(h.Close, out var close) ? close : new TimeOnly(17, 0)
            });

            await businessRepository.ReplaceHoursAsync(id, hours);
            return Results.NoContent();
        }).RequireAuthorization("BusinessOwnerOnly");

        // GET available booking slots for a service on a date (slots stepped by service duration).
        group.MapGet("/{id:guid}/availability", async (
            Guid id,
            Guid serviceId,
            DateOnly date,
            IBusinessRepository businessRepository,
            IAppointmentRepository appointmentRepository) =>
        {
            var business = await businessRepository.GetByIdAsync(id);
            if (business == null) return Results.NotFound("Business not found.");

            var service = business.Services.FirstOrDefault(s => s.Id == serviceId);
            if (service == null) return Results.NotFound("Service not found.");

            // Business-specific model: auto-assign the Manager (fallback first worker).
            var worker = business.Workers.FirstOrDefault(w => w.Role == WorkerRole.Manager)
                         ?? business.Workers.FirstOrDefault();
            if (worker == null) return Results.Ok(Array.Empty<DateTimeOffset>());

            var dayHours = business.Hours.FirstOrDefault(h => h.DayOfWeek == date.DayOfWeek);
            var existing = await appointmentRepository.GetByWorkerAndDateAsync(worker.Id, date);

            var slots = SlotGenerator.Generate(
                dayHours, service.DurationInMinutes, date, existing, DateTimeOffset.UtcNow, business.TimeZoneId);
            return Results.Ok(slots);
        }).RequireAuthorization();
    }
}