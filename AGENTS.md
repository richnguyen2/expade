# Expade — monorepo agent guide

Expade is a local-services marketplace (think DoorDash, but for services): customers discover and book local service providers; businesses manage their listing, services, team, and bookings.

## Layout
- **`web/`** — Next.js frontend → read **`web/AGENTS.md`**.
- **`backend/`** — ASP.NET Core (.NET 10) API → read **`backend/AGENTS.md`**.

Always read the relevant subdirectory's `AGENTS.md` before working in it.

## Core product flow
User signs up (Clerk) → requests a business at `/business-signup` (address geocoded) → admin approves at `/admin/requests` → owner onboards services + team at `/onboard/[id]` → business goes live and is discoverable on `/home` → customers book appointments (**not built yet**).

## Cross-cutting
- **Auth is Clerk.** Roles live in Clerk metadata and are mirrored to the DB (details in `backend/AGENTS.md`).
- **Frontend types mirror backend DTOs exactly** — when you change a contract on one side, change the other in the same pass.
- **Verify by building**: `web/` → `npm run build`; `backend/` → `dotnet build`. Restart the backend after contract changes.
- Dev ports: web `:3000`, API `:5055`.
