# Expade

**Live at → [joinexpade.com](https://joinexpade.com)**

A local-services marketplace — think DoorDash, but for services. Customers discover and book local service providers; businesses manage their listing, services, team, schedule, and bookings.

- **Discovery & booking** — browse businesses by category, view services, and book appointments against real availability.
- **Business onboarding** — request a listing (address autocompleted + geocoded), get approved by an admin, then set up services, team, and weekly hours.
- **Owner dashboard** — manage services, staff, operating hours, blocked time, and an appointment schedule with accept/decline.

---

## Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (on Base UI), TanStack Query v5 |
| **Backend** | ASP.NET Core (.NET 10) minimal APIs, Clean Architecture, EF Core + Npgsql |
| **Database** | PostgreSQL 16 |
| **Auth** | Clerk (JWT; roles mirrored to the DB) |
| **External services** | OpenCage (geocoding), Resend (transactional email) |
| **Hosting** | Vercel (web) · Fly.io (API) · Neon (Postgres) |

---

## Repository layout

```
expade/
├── web/                  # Next.js frontend            → see web/AGENTS.md
├── backend/              # ASP.NET Core API             → see backend/AGENTS.md
│   ├── src/
│   │   ├── Expade.Core/           # entities, enums, interfaces, domain services
│   │   ├── Expade.Application/    # use-case orchestrators (app services)
│   │   ├── Expade.Infrastructure/ # EF DbContext, repositories, external services, migrations
│   │   └── Expade.API/            # minimal-API endpoints, contracts, validators, Program.cs
│   └── tests/Expade.Tests/        # xUnit + NSubstitute unit tests
├── docker-compose.yml    # db + backend + web for a full local stack
├── .env.example          # template for docker-compose secrets
└── AGENTS.md             # contributor guide (read before working in a subdir)
```

The backend follows Clean Architecture: dependencies flow `API → Application → Core` and `API → Infrastructure → Core`. The frontend's TypeScript types mirror the backend DTOs exactly — change a contract on one side and you change it on the other in the same pass.

## Product flow

```
Sign up (Clerk)
  → request a business at /business-signup (address autocompleted + geocoded)
  → admin approves at /admin/requests
  → owner onboards services + team + hours at /onboard/[id]
  → business goes live and is discoverable on /home
  → customers book appointments; owners manage them on the dashboard schedule
```

---

## Prerequisites

- **Docker Desktop** (for the database, and optionally the full stack)
- **.NET 10 SDK** — for running the API natively
- **Node.js 20+** and **npm** — for running the web app natively
- Accounts / API keys (free tiers are fine):
  - **Clerk** — auth (`https://dashboard.clerk.com`)
  - **OpenCage** — geocoding (`https://opencagedata.com`)
  - **Resend** — email (`https://resend.com`)

---

## Getting started

There are two ways to run Expade locally. For day-to-day development, prefer **Option A** (native apps + Dockerized DB) — it has the fastest feedback loop. Use **Option B** (full Docker) to verify the production-like container build before shipping.

> ⚠️ Never run a native service and its Dockerized copy at the same time — they'll collide on the same port (web `:3000`, API `:5055`).

### Option A — Native dev (recommended)

Run the database in Docker, and the API + web natively for hot reload.

**1. Start the database**

```bash
docker compose up db -d
```

This serves Postgres on `localhost:5433` (database `ExpadeDb`, user `postgres`, password `yourpassword`).

**2. Configure backend secrets**

Non-secret config (connection string, Clerk authority, CORS, etc.) already lives in `backend/src/Expade.API/appsettings.Development.json`. Provide the secrets via .NET user-secrets:

```bash
cd backend/src/Expade.API
dotnet user-secrets set "Clerk:SecretKey"     "sk_test_xxx"
dotnet user-secrets set "Clerk:WebhookSecret" "whsec_xxx"
dotnet user-secrets set "OpenCageApiKey"      "xxx"
dotnet user-secrets set "Resend:ApiKey"       "re_xxx"
```

> Make sure the `Clerk:Authority` in `appsettings.Development.json` matches your Clerk instance.

**3. Run the API**

```bash
cd backend
dotnet run --project src/Expade.API   # http://localhost:5055  (https 7089)
```

Pending EF migrations are applied automatically on startup, so the DB must be reachable. **Restart the API to pick up code or contract changes.**

**4. Configure and run the web app**

Create `web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5055/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/home
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/
```

```bash
cd web
npm install
npm run dev                            # http://localhost:3000
```

Open **http://localhost:3000**.

### Option B — Full Docker stack

Runs db + backend + web together in containers — closest to production.

```bash
cp .env.example .env     # then fill in your keys
docker compose up --build
```

- web → http://localhost:3000
- API → http://localhost:5055
- db  → localhost:5433

`NEXT_PUBLIC_*` values are baked into the web image at **build time** (passed as build args in `docker-compose.yml`), so changing them requires a rebuild. Code changes also require `docker compose up --build` to take effect — for live reload, use Option A instead.

---

## Webhooks (optional, for local role sync)

Clerk mirrors user data into the DB via a `user.created` / `user.updated` webhook. The app is self-healing (it provisions a user just-in-time on first authenticated request), so the webhook is only needed to keep roles fresh locally. To receive it, expose the API with a tunnel (e.g. ngrok) and point a Clerk webhook at:

```
https://<your-tunnel>/api/webhooks/clerk
```

To make yourself an **admin** locally, set `public_metadata.role = "Admin"` on your user in the Clerk dashboard, then refresh.

---

## Common commands

**Backend** (run from `backend/`)

```bash
dotnet build                                   # build + verify
dotnet test                                    # run unit tests (xUnit + NSubstitute)
dotnet run --project src/Expade.API            # run the API

# add a migration
dotnet ef migrations add <Name> \
  --project src/Expade.Infrastructure \
  --startup-project src/Expade.API
```

**Frontend** (run from `web/`)

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build    # production build + typecheck — use this to verify changes
npm run lint
```

## Ports

| Service | Port |
|---|---|
| Web | `3000` |
| API | `5055` (https `7089`) |
| Postgres | `5433` |

---

## Deployment

Production is live at **[joinexpade.com](https://joinexpade.com)**, running on a low-cost, config-driven stack:

- **Web** → Vercel, served at [joinexpade.com](https://joinexpade.com) (auto-deploys on push to `main`; previews per PR). `NEXT_PUBLIC_*` env vars are build-time.
- **API** → Fly.io (`backend/fly.toml`; container build; TLS terminated at the edge with forwarded headers). Migrations auto-apply on deploy.
- **Database** → Neon (managed Postgres). Use the **pooled** connection string in Npgsql keyword form.
- **Auth** → a separate Clerk **production** instance with custom-domain DNS.

All app config is environment-driven — no environment-specific values are hardcoded. CI (`.github/workflows/ci.yml`) runs backend build + test and web build on every push/PR to `main`; `deploy.yml` ships the backend to Fly on merge.

---

## Contributing

Before working in a subdirectory, read its `AGENTS.md` — it documents the conventions, patterns, and gotchas for that side of the codebase:

- [`AGENTS.md`](AGENTS.md) — monorepo overview
- [`web/AGENTS.md`](web/AGENTS.md) — frontend conventions
- [`backend/AGENTS.md`](backend/AGENTS.md) — backend conventions

**Verify before pushing:** `web/` → `npm run build`; `backend/` → `dotnet build && dotnet test`.
