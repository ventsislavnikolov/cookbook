# Neon Auth Migration — Design

## Goal

Replace the self-hosted Better Auth stack with Neon Auth so that:

- User identity is managed in the Neon console (create/list/disable users in the UI).
- User records live in Neon's read-only `neon_auth.users_sync` table; the app does not own a `users` table.
- Better Auth is fully removed from the codebase and dependencies.

The migration is dev-only — there is no production user data to preserve.

## Non-goals

- Social / OAuth providers (email+password only, matching current behavior).
- Webhooks from Neon into the app.
- Preserving existing local auth rows — dev data is wiped.

## Architecture

```
Before:                             After:
┌──────────────┐                    ┌──────────────┐
│  React app   │                    │  React app   │
│  authClient  │                    │  authClient  │
│ (better-auth)│                    │ (neon-auth)  │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
┌──────▼────────────────┐           ┌──────▼──────────────┐
│ /api/auth/*           │           │  Neon Auth service   │
│ Better Auth server    │           │  (hosted by Neon)    │
│ (own users/sessions/  │           └──────┬──────────────┘
│  accounts/            │                  │ syncs
│  verifications)       │           ┌──────▼──────────────┐
└──────┬────────────────┘           │ neon_auth.users_sync │
       │                            │   (read-only)        │
┌──────▼────────────────┐           └──────────────────────┘
│ app tables FK → users │                  ▲
└───────────────────────┘                  │ logical ref (text)
                                    ┌──────┴──────────────┐
                                    │ user_profiles       │
                                    │  (app-owned)        │
                                    │  user_id PK         │
                                    │  household_id FK    │
                                    └─────────────────────┘
                                           ▲
                                    ┌──────┴──────────────┐
                                    │ app tables          │
                                    │ FK → user_profiles  │
                                    │ (or plain text ref) │
                                    └─────────────────────┘
```

## Schema changes

**Drop:**

- `users`, `sessions`, `accounts`, `verifications` tables and their drizzle relations.

**Add:**

- `neon_auth.users_sync` — external, Neon-managed, declared in drizzle for typed reads only; never touched by migrations.
- `user_profiles` (app-owned):
  - `user_id text` PRIMARY KEY — logical ref to `neon_auth.users_sync.id` (no hard FK; cross-schema FKs to a Neon-managed table are brittle).
  - `household_id integer NOT NULL REFERENCES households(id)`.
  - `display_name text` — optional; used if Neon Auth's SDK does not expose `updateUser({ name })` (resolved at implementation time).
  - `created_at timestamp DEFAULT now() NOT NULL`.

**FK rewiring:**

Every table that currently references `users.id` (e.g. `recipes.created_by`, `cook_logs.cooked_by`) is changed to a plain `text` column with no hard FK constraint. The app enforces the invariant that these ids exist in `user_profiles` (and therefore in `neon_auth.users_sync`) via `requireProfile`.

## Server layer

**Remove:**

- `src/server/auth/` directory (all Better Auth server config).
- `/api/auth/*` route handler that mounts Better Auth.
- `src/lib/auth.functions.ts` (`getSession` helper).
- `better-auth` and `better-auth/adapters/drizzle` from `package.json`.
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` from `.env` and `.env.example`.

**Add:**

- `NEON_AUTH_*` env vars per Neon's quickstart (project id, publishable key, server API key/URL — exact names resolved at implementation time).
- `src/server/auth.ts` — `getSessionUser(request)`: validates the Neon session token from cookie or header using Neon's server SDK. Returns `{ userId, email, name } | null`.
- `src/server/profile.ts`:
  - `requireProfile(userId)`: returns `{ userId, householdId }`. Lazy-provisions a `user_profiles` row plus a new `households` row in a single transaction if the profile is missing.
  - `withProfile(fn)`: server-function wrapper that runs `getSessionUser` → `requireProfile` and passes `{ userId, householdId }` into the handler.

**Route guard:**

`src/routes/_app.tsx`'s server-side check swaps `getSession()` for `getSessionUser()` + `requireProfile()`. Unauthenticated → redirect to `/sign-in`.

## Lazy provisioning

On first authenticated request per user:

1. `SELECT * FROM user_profiles WHERE user_id = $1`.
2. If present → return it.
3. If missing → in one transaction:
   - `INSERT INTO households (name) VALUES ('My Household') RETURNING id`.
   - `INSERT INTO user_profiles (user_id, household_id) VALUES ($1, $newHouseholdId) ON CONFLICT (user_id) DO NOTHING`.
   - If the insert affected zero rows (concurrent request won the race) → `DELETE FROM households WHERE id = $newHouseholdId` and re-`SELECT` the existing profile.
4. Return `{ userId, householdId }`.

This avoids webhook configuration and tolerates the rare double-first-request race.

## Client layer

Replace `src/lib/auth-client.ts` with Neon Auth's React SDK (exact package name resolved at implementation time — likely `@neondatabase/auth/react` or similar).

Call-site changes across `src/routes/sign-up.tsx`, `src/routes/sign-in.tsx`, `src/routes/_app.tsx`, `src/routes/_app/settings.tsx`:

| Current | Replacement |
|---|---|
| `authClient.useSession()` | Neon Auth session/user hook |
| `authClient.signUp.email({ name, email, password })` | Neon Auth sign-up |
| `authClient.signIn.email({ email, password })` | Neon Auth sign-in |
| `authClient.signOut()` | Neon Auth sign-out |
| `authClient.updateUser({ name })` | Neon Auth update-user if supported; otherwise write to `user_profiles.display_name` |

## Seeding

`seed:reset` is updated to either:

- Create test users via Neon Auth's admin API and then seed `user_profiles` + household + domain rows keyed to those user ids; or
- Skip user creation and seed a fixed `user_profiles` row keyed to a manually-created Neon user id passed via env.

The first option is preferred if Neon exposes a programmatic admin-create API for dev branches.

## Rollout

Single branch, atomic PR:

1. Drizzle schema changes; `pnpm db:generate` + `pnpm db:push`. Verify `neon_auth.users_sync` exists.
2. Delete server auth code and route handler.
3. Add `src/server/auth.ts` and `src/server/profile.ts`.
4. Swap the client and rewrite call-sites.
5. Rewire server functions that read `householdId` through `withProfile`.
6. Update `seed:reset`.
7. Uninstall `better-auth`; install Neon SDKs; update env files.
8. Smoke-test: sign up → `/app` → household auto-created → create recipe → visible in `/recipes`.
9. Update Playwright e2e selectors if form fields changed.

Rollback is a single revert — no prod data at risk.

## Open questions

- Exact Neon Auth SDK package name and API surface (signUp / signIn / useUser / updateUser signatures) — confirm against https://neon.com/docs/auth/overview during implementation.
- Whether Neon exposes a programmatic admin-create user endpoint suitable for `seed:reset`.
- Whether `updateUser({ name })` exists client-side, or if we need `user_profiles.display_name`.
