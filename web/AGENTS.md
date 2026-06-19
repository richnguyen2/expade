<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Expade web (frontend)

The text above is auto-managed — keep it. Everything below is project guidance; update it when conventions change.

## Stack (verified versions)
- **Next.js 16.2.7** (App Router + Turbopack), **React 19.2**. APIs differ from older Next — when using an unfamiliar Next API, read `node_modules/next/dist/docs/` first instead of guessing.
- **TypeScript strict. No `any`** — types mirror the backend DTOs.
- **Tailwind CSS v4** — CSS-first config. **There is no `tailwind.config`**; design tokens live in `src/app/globals.css` (`@theme` + `:root` CSS variables).
- **shadcn/ui built on Base UI** (`@base-ui/react`), NOT Radix. Primitives are in `src/components/ui/`.
- **Clerk v7** (`@clerk/nextjs`) auth · **TanStack Query v5** server state · `lucide-react` icons.
- Middleware is **`src/proxy.ts`** (this version's name), not `middleware.ts`.
- `React.FormEvent` shows as deprecated here — that's expected, not a real error.

## Commands (run from `web/`)
- `npm run dev` — http://localhost:3000
- `npm run build` — production build + typecheck; **use this to verify changes**
- `npm run lint`
- Add a shadcn primitive: `npx shadcn@latest add <name>` (must run from `web/`).

## Structure & conventions
- `src/components/`: `ui/` (shadcn) · `layout/` (Navbar, Sidebar, Admin*, Logo) · feature folders `business/`, `home/`, `landing/`, `onboard/`. **Group page UI by feature under `components/`; do NOT use co-located `app/**/_components`.**
- `src/hooks/` — data hooks (`useBusiness`, `useCategories`, `useServiceMutations`, …), re-exported from `@/hooks`. **Use these; never inline `useQuery`/`useMutation` + `getToken()` in a component.**
- `src/lib/constants.ts` — `QUERY_KEYS`; use for every query key. `src/lib/` also holds `utils.ts` (`cn`) and `categoryIcons.ts`.
- `src/services/` — thin layer over the generic-typed `apiClient`. `src/types/` — `enums.ts` + `api.ts`, imported from `@/types`. **Frontend types mirror backend contracts exactly** (e.g. `BusinessResponse` has a flat `categoryName`, not a nested category object).

## Design system (bold & modern)
- **Use brand/semantic tokens; never hardcode colors.** `bg-primary`/`text-primary` = brand green; also `bg-card`, `bg-muted`, `text-muted-foreground`, `border-border`, `text-destructive`, `bg-primary/10`. The legacy `#708238` hex must not appear in new code.
- Compose from shadcn `Button`, `Input`, `Label`, `Textarea`, `Badge`, `Card`, `Dialog`, `Tabs`.
- Base UI API notes: `<Tabs value onValueChange>` + `<TabsTrigger value>`; `<Dialog open onOpenChange>`. `useSearchParams()` must be under a `<Suspense>` boundary.

## Hooks inventory (src/hooks/)
- `business.ts` — `useBusinesses`, `useBusiness`, `useMyBusinesses`, `useUpdateBusiness`, `useCreateBusinessFromRequest`, `useServiceMutations`, `useBusinessHours`, `useUpdateBusinessHours`, `useAvailability`
- `appointment.ts` — `useMyAppointments`, `useCreateAppointment`, `useUpdateAppointmentStatus`
- `category.ts` — `useCategories`
- `businessRequest.ts` — `useBusinessRequests`, `useOnboardingData`, `useSubmitBusinessRequest`, `useUpdateRequestStatus`
- **Pending hooks (not yet built):** `useBusinessAppointments(businessId)` (owner schedule view), `useBlockedTimes(businessId)`, `useCreateBlockedTime(businessId)`, `useDeleteBlockedTime(businessId)`

## Pages & routes
- `/` — landing
- `/home` — discover feed + category bar
- `/businesses/[id]` — public business detail with booking entry
- `/appointments` — client's My Appointments list
- `/appointments/[serviceId]?businessId=` — booking flow (date → slots → confirm)
- `/my-businesses` — owner's business list
- `/my-businesses/dashboard/[id]?tab=` — owner dashboard (Overview, Schedule, Services, Team, Hours, Settings tabs)
- `/onboard/[id]` — post-approval business setup (description + services + workers + hours + timezone)
- `/business-signup` — submit a new business request
- `/admin/requests` — admin approval queue

## Pending frontend work
- **Business timezone selector** — add `timeZoneId` field to onboard form and Settings tab (depends on backend `TimeZoneId` field being added to `Business` + DTO).
- **Schedule tab build-out** — replace placeholder with owner appointment list (accept/decline), blocked times section, "Block time" dialog. Needs `useBusinessAppointments` + `useBlockedTimes` hooks and the `GET /api/businesses/{id}/appointments` backend endpoint.
- **Frontend validation** — `react-hook-form` + `zod` on business-signup, onboard, settings forms; address autocomplete returning validated lat/lon.

## Backend contract
API base is `process.env.NEXT_PUBLIC_API_URL` (`http://localhost:5055/api` in dev). The categories endpoint is public; everything else needs the Clerk token (hooks handle it). See `backend/AGENTS.md`. **After changing a backend contract, restart the backend before testing.**
