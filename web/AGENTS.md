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
- `src/components/`: `ui/` (shadcn) · `layout/` (Navbar, Sidebar, Admin*, Logo) · `forms/` (e.g. `AddressAutocomplete`) · feature folders `business/`, `home/`, `landing/`, `onboard/`. **Group page UI by feature under `components/`; do NOT use co-located `app/**/_components`.**
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
- `address.ts` — `useAddressSearch` (on-demand address autocomplete; mutation)
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

## Forms & validation
- **`react-hook-form` + `zod`** for validated forms (`@hookform/resolvers/zod`). Shared schemas live in `src/lib/validation.ts` (`emailSchema`, `phoneSchema`, `businessSignupSchema`, `businessSettingsSchema`) and **mirror the backend FluentValidation rules**. Show inline `text-destructive` errors; never `alert()`.
- **Address is a selectable autocomplete**, not free text: `components/forms/AddressAutocomplete.tsx` (search-on-demand — type, press Find, pick a match). It hits `GET /api/addresses/search` (authenticated, rate-limited, proxies OpenCage server-side) via `useAddressSearch()`. The backend re-geocodes on submit, so the form only needs the chosen address string.
- Applied on: business-signup (RHF+zod+autocomplete), Settings tab (RHF+zod), onboard (targeted checks — filters empty service rows, validates worker emails). The onboard dynamic form isn't full-RHF yet.

## Pending frontend work
- Onboard form could move to full `react-hook-form` + `useFieldArray` (currently targeted validation).
- Discovery pagination/filtering UI once the backend `GET /api/businesses` gains query params.

## Backend contract
API base is `process.env.NEXT_PUBLIC_API_URL` (`http://localhost:5055/api` in dev). The categories endpoint is public; everything else needs the Clerk token (hooks handle it). See `backend/AGENTS.md`. **After changing a backend contract, restart the backend before testing.**
