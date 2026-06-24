# Expade — monorepo agent guide

Expade is a local-services marketplace (think DoorDash, but for services): customers discover and book local service providers; businesses manage their listing, services, team, and bookings.

## Layout
- **`web/`** — Next.js frontend → read **`web/AGENTS.md`**.
- **`backend/`** — ASP.NET Core (.NET 10) API → read **`backend/AGENTS.md`**.

Always read the relevant subdirectory's `AGENTS.md` before working in it.

## Core product flow
User signs up (Clerk) → requests a business at `/business-signup` (address autocompleted + geocoded) → admin approves at `/admin/requests` → owner onboards services + team + hours at `/onboard/[id]` → business goes live and is discoverable on `/home` → customers book appointments; owners manage them on the dashboard Schedule calendar.

## Running it
- **Dev (no containers):** API → `cd backend && dotnet run --project src/Expade.API` (:5055); web → `cd web && npm run dev` (:3000). Needs a local Postgres + the secrets below.
- **Docker:** `cp .env.example .env`, fill in keys, then `docker compose up` from the repo root (postgres + backend + web). The backend auto-applies migrations on startup.

## Cross-cutting
- **Auth is Clerk.** Roles live in Clerk metadata and are mirrored to the DB (details in `backend/AGENTS.md`).
- **Frontend types mirror backend DTOs exactly** — when you change a contract on one side, change the other in the same pass.
- **Verify**: `web/` → `npm run build`; `backend/` → `dotnet build` + `dotnet test`. Restart the backend after contract changes.
- **CI** (`.github/workflows/ci.yml`) runs backend build+test and web build on push/PR to `main`.
- Dev ports: web `:3000`, API `:5055`, Postgres `:5433`.
