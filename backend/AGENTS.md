# Expade backend — agent guide

ASP.NET Core (.NET 10) minimal-API marketplace backend, Clean Architecture. Update this file when conventions change.

## Stack & layout
- **.NET 10**, ASP.NET Core minimal APIs. **EF Core + Npgsql (PostgreSQL).** Clerk JWT bearer auth. Scalar for API docs (dev only).
- Three projects under `src/` (solution: `Expade.slnx`):
  - **`Expade.Core`** — domain entities, enums, repository interfaces. No outward dependencies.
  - **`Expade.Infrastructure`** — `AppDbContext`, EF repositories, external services (Email via Resend, geocoding via OpenCage). **EF migrations live here.**
  - **`Expade.API`** — minimal-API endpoints, request/response contracts, mappings, webhooks, `Program.cs`.

## Commands (run from `backend/`)
- `dotnet build` — build + verify; **use after every change.**
- `dotnet run --project src/Expade.API` — http://localhost:5055 (https 7089). **Restart it to pick up code/contract changes.**
- Migration: `dotnet ef migrations add <Name> --project src/Expade.Infrastructure --startup-project src/Expade.API`
- Secrets (user-secrets / env on `Expade.API`): `Clerk:SecretKey`, `Clerk:WebhookSecret`, `OpenCageApiKey`, `Resend:ApiKey`. Connection string, `Clerk:Authority`, `Frontend:BaseUrl`, `Resend:FromAddress`, CORS origins live in `appsettings.Development.json`.

## Conventions
- **Endpoints return DTOs, never EF entities.** DTOs are `record`s in `Expade.API/Contracts/{Businesses,BusinessRequests}/`. Namespaces: `Expade.API.Contracts.Businesses.*` and `Expade.API.Contracts.BusinessRequests.*` (note the correct singular **"BusinessRequests"**).
- **Entity → DTO mapping is centralized** in `Expade.API/Mappings/ContractMappings.cs` (`.ToResponse()`, `.ToListItemResponse()`, `.ToSummaryResponse(userId)`, …). Keep endpoints thin; don't hand-map inline.
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
- `BlockedTime` — **NOT YET BUILT.** Planned entity: `Id, BusinessId, StartDateTime, EndDateTime, Reason?`. Blocks availability slots for external bookings / personal time. `SlotGenerator` must exclude overlapping blocked times alongside existing appointments.
- `Service`, `Worker`, `User`, `BusinessRequest`, `Category` — standard.

## Appointments & availability patterns
- `SlotGenerator` (`Expade.API/Services/SlotGenerator.cs`) — static `Generate(dayHours, durationMinutes, date, existingAppointments, now)`. **Currently generates slots at UTC offset zero — broken for any business not in UTC.** Fix: add `TimeZoneId` param, use `TimeZoneInfo` to build correctly-offset `DateTimeOffset` slots.
- `GET /api/businesses/{id}/availability?serviceId=&date=` — returns `DateTimeOffset[]` (ISO strings). Frontend calls `new Date(iso).toLocaleTimeString()` to display in user's local time.
- `POST /api/appointments` — auto-assigns Manager (fallback first worker), re-validates the slot server-side to guard races. After save, sends email to the Manager (pending email notification feature).
- `PATCH /api/appointments/{id}/status` — client may cancel own; staff (any worker at that business) may confirm, complete, or cancel.
- **Missing endpoint:** `GET /api/businesses/{id}/appointments` — owner view of all appointments for that business. Required by the dashboard Schedule tab.

## Known gaps (Tier 5 backlog — build these, don't work around them)
- **Business timezone** — add `TimeZoneId` (string) to `Business`, migration, use in `SlotGenerator`. Without this, slot times are offset by the business's UTC delta.
- **`BlockedTime` entity + endpoints** — owners need to block time slots for external/personal use. Slot generator must exclude overlapping blocks.
- **`GET /api/businesses/{id}/appointments`** — owner view for the Schedule tab (all appointments, not just the signed-in client's).
- **Appointment notification email** — fire `emailService.SendNewAppointmentEmailAsync` in `POST /appointments` to notify the Manager.
- **`AppDbContext` leak** in `BusinessRequestEndpoints` (two endpoints still inject EF directly — move to repo).
- **Manager-only service management** — `POST/PUT/DELETE /{id}/services` only check `workerRecord != null` (any employee can mutate services). Should require `WorkerRole.Manager`.
- No FluentValidation, no global exception handler, no application/service layer, no tests.
