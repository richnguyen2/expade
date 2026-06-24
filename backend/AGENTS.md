# Expade backend — agent guide

ASP.NET Core (.NET 10) minimal-API marketplace backend, Clean Architecture. Update this file when conventions change.

## Stack & layout
- **.NET 10**, ASP.NET Core minimal APIs. **EF Core + Npgsql (PostgreSQL).** Clerk JWT bearer auth. Scalar for API docs (dev only).
- Four projects under `src/` (solution: `Expade.slnx`). Dependency flow: `API → Application → Core` and `API → Infrastructure → Core`.
  - **`Expade.Core`** — domain entities, enums, repository + external-service interfaces (`IEmailService`/`IGeocodingService`/`IClerkService`), and **domain services** (`Core/Services/SlotGenerator.cs` — pure, stateless calculations). No outward dependencies.
  - **`Expade.Application`** — **application services** (use-case orchestrators) in feature folders (`Businesses/`, `BusinessRequests/`, `Appointments/`, `BlockedTimes/`), shared `Common/BusinessAccess` (auth/identity resolution), and `Exceptions/` (`NotFound`/`Forbidden`/`Validation`/`Conflict`). Depends only on Core.
  - **`Expade.Infrastructure`** — `AppDbContext`, EF repositories, external service impls (Email/Resend, geocoding/OpenCage, Clerk). **EF migrations live here.**
  - **`Expade.API`** — thin minimal-API endpoints, request/response contracts, `Mappings/ContractMappings`, `Validators/` (FluentValidation), `Filters/ValidationFilter`, `Handlers/GlobalExceptionHandler`, `Extensions/ClaimsPrincipalExtensions`, webhooks, `Program.cs`.

## Commands (run from `backend/`)
- `dotnet build` — build + verify; **use after every change.**
- `dotnet test` — runs `tests/Expade.Tests` (xUnit + NSubstitute): SlotGenerator, FluentValidation validators, and app-service auth/guard paths. Pure unit tests (no DB/HTTP) — keep them fast and add to them.
- `dotnet run --project src/Expade.API` — http://localhost:5055 (https 7089). **Restart it to pick up code/contract changes.** Startup applies pending EF migrations automatically (`Database.Migrate()`), so the DB must be reachable on boot.
- Migration: `dotnet ef migrations add <Name> --project src/Expade.Infrastructure --startup-project src/Expade.API`
- Secrets (user-secrets / env on `Expade.API`): `Clerk:SecretKey`, `Clerk:WebhookSecret`, `OpenCageApiKey`, `Resend:ApiKey`. Connection string, `Clerk:Authority`, `Frontend:BaseUrl`, `Resend:FromAddress`, CORS origins live in `appsettings.Development.json`.

## Conventions
- **Endpoints are thin: bind → resolve clerkId → call an app service → map entity → return.** No business logic, repos, or `AppDbContext` in endpoints. Get the caller's Clerk id with `userPrincipal.GetClerkId()` (extension); app services take `clerkId` and resolve the `User` themselves (via `IBusinessAccess`).
- **App services orchestrate use cases** and work in **entities**; they never return DTOs. They throw `Expade.Application.Exceptions.*` (`NotFoundException`→404, `ForbiddenException`→403, `ValidationException`→400, `ConflictException`→409) instead of HTTP results — `Handlers/GlobalExceptionHandler` turns these (and unexpected errors → opaque 500) into RFC 7807 ProblemDetails. Don't catch-and-`Results.Problem` in endpoints.
- **Validation**: FluentValidation validators in `Expade.API/Validators/`, applied per-endpoint with `.WithValidation<TRequest>()`. Format/shape rules live here; business-rule checks live in the app service.
- **Endpoints return DTOs, never EF entities.** DTOs are `record`s in `Expade.API/Contracts/{Businesses,BusinessRequests,Appointments}/`. Namespaces: `Expade.API.Contracts.Businesses.*` / `.BusinessRequests.*` / `.Appointments.*` (note the correct singular **"BusinessRequests"**).
- **Entity → DTO mapping is centralized** in `Expade.API/Mappings/ContractMappings.cs` (`.ToResponse()`, `.ToListItemResponse()`, `.ToSummaryResponse(userId)`, …). The endpoint maps; the app service doesn't.
- **Service management is Manager-only** (`IBusinessAccess.RequireManagerAsync`); any worker may view a business's schedule (`RequireStaffAsync`).
- **Auditing**: entities implementing `IAuditable` get `UpdatedAt` auto-stamped by `AppDbContext.SaveChanges` (Business/Service/Worker).
- Data access goes through repository interfaces (`Expade.Core/Interfaces`) implemented in `Infrastructure/Repositories`. **Endpoints should not touch `AppDbContext` directly** (a couple of legacy spots still do — fix, don't copy).
- JSON serializes enums as strings (`JsonStringEnumConverter`). In the **DB, enums are stored as int** — `UserRole`: User=0, Worker=1, BusinessOwner=2, Admin=3.

## Roles & auth (read before touching role logic)
- Admin/role is granted in **Clerk `public_metadata.role`**; the `AdminOnly` / `BusinessOwnerOnly` / `Worker` policies read the role claim from the Clerk JWT.
- The local DB `User.Role` is mirrored from Clerk via the **`user.updated`** webhook (`Endpoints/WebhookEnpoints.cs`). That event must be subscribed in the Clerk dashboard, or the DB role drifts.
- In `PATCH /business-requests/{id}/status`, `user` is the **request submitter**, not the admin caller. Role guards check the DB role, so keep it in sync.
- The categories endpoint is **public** (`AllowAnonymous`); most others require auth.

## Domain entities (current)
- `Business` — `Id, Name, Phone, Address, Latitude, Longitude, CategoryId, Description, RequestId`. **Missing: `TimeZoneId` (string, IANA) — add this before building timezone-aware availability.**
- `BusinessHours` — per `(BusinessId, DayOfWeek)`, `IsOpen`, `OpenTime`/`CloseTime` (`TimeOnly`). Unique index on `(BusinessId, DayOfWeek)`.
- `Appointment` — `Id, ClientId, WorkerId, ServiceId, StartDateTime (DateTimeOffset), Status`. Status enum: `Pending=0, Confirmed=1, Completed=2, Cancelled=3`.
- `BlockedTime` — `Id, BusinessId, StartDateTime, EndDateTime (DateTimeOffset, UTC), Reason?`. Blocks availability for external bookings / personal time; `SlotGenerator` excludes overlapping blocks.
- `Service`, `Worker`, `User`, `BusinessRequest`, `Category` — standard. `Business.TimeZoneId` (IANA) drives scheduling; `Business`/`Service`/`Worker` carry auto-stamped `UpdatedAt`.

## Appointments & availability patterns
- **Times are stored as UTC, displayed in the business's timezone.** Npgsql rejects a non-zero-offset `DateTimeOffset` for `timestamp with time zone`, so always persist UTC. `SlotGenerator.ToInstant` returns UTC; appointment/blocked-time writes call `.ToUniversalTime()`.
- `SlotGenerator` (`Expade.Core/Services/SlotGenerator.cs`) — pure domain service. `Generate(dayHours, durationMinutes, date, existing, blocked, now, timeZoneId)` builds slots in the business tz (DST-aware) and returns UTC instants. Also `ResolveTimeZone`, `ToInstant`, `LocalDateFor`.
- `GET /api/businesses/{id}/availability?serviceId=&date=` → UTC `DateTimeOffset[]`. Frontend formats in the business tz (`formatTimeInZone`).
- `POST /api/appointments` — auto-assigns Manager (fallback first worker), re-validates the slot, emails staff. `PATCH /{id}/status` — client cancels own; staff confirm/complete/cancel (emails client on confirm).
- `GET /api/businesses/{id}/appointments` — owner schedule view (any staff). Blocked-times CRUD under `/api/businesses/{id}/blocked-times` (GET staff, POST/DELETE Manager).

## Known gaps (remaining backlog)
- **Discovery is unscalable** — `GET /api/businesses` returns ALL businesses. Add `?categoryId=&page=&pageSize=&search=&lat=&lon=&radiusKm=` + indexes. (Deferred: changes the frontend contract — coordinate with the web side.)
- **No tests / CI / docker-compose** (Tier 6).
- Frontend validation (email/phone/address-autocomplete) still pending on the web side.
