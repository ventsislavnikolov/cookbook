# Neon Auth Migration — Design

> **Revised 2026-04-23** after SDK discovery. See [docs/notes/neon-auth-sdk.md](../../notes/neon-auth-sdk.md) for source-of-truth package names, env vars, and API shapes. Neon Auth v0.2 is built on **Better Auth** (v0.1 was Stack Auth — deprecated).

## Goal

Replace the self-hosted Better Auth stack with **Neon Auth v0.2** so that:

- User identity is managed in the Neon console (create/list/disable users in the UI).
- User records live in Neon's read-only `neon_auth.user` table; the app does not own a `users` table.
- Our in-repo Better Auth server config, `/api/auth/*` handler, and local auth tables are removed.

The migration is dev-only — no production user data to preserve.

Note: `better-auth` stays as a transitive dependency of `@neondatabase/neon-js`. We remove our **own** Better Auth server setup (custom `createAuth`, DB adapter, schema, `/api/auth/*` mount), not Better Auth itself.

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
│ (better-auth)│                    │ (neon-js)    │
└──────┬───────┘                    └──────┬───────┘
       │                                   │ cookie session
┌──────▼────────────────┐           ┌──────▼──────────────┐
│ /api/auth/*           │           │  Neon Auth service   │
│ Better Auth server    │           │  (Better Auth under  │
│ (own users/sessions/  │           │   the hood, hosted)  │
│  accounts/            │           └──────┬──────────────┘
│  verifications)       │                  │ syncs
└──────┬────────────────┘           ┌──────▼──────────────┐
       │                            │ neon_auth.user       │
┌──────▼────────────────┐           │ neon_auth.session    │
│ app tables FK → users │           │ neon_auth.account    │
└───────────────────────┘           │ neon_auth.verification│
                                    │   (read-only)        │
                                    └──────────────────────┘
                                           ▲
                                    ┌──────┴──────────────┐
                                    │ user_profiles       │
                                    │  (app-owned)        │
                                    │  user_id text PK    │
                                    │  household_id FK    │
                                    └─────────────────────┘
                                           ▲
                                    ┌──────┴──────────────┐
                                    │ app tables          │
                                    │ created_by_id text  │
                                    │ (no hard FK)        │
                                    └─────────────────────┘
```

## Packages & env

- **Client:** `@neondatabase/neon-js@0.2.0-beta.1`.
- **Server session validation:** no SDK. We forward the request's `Cookie` header to `${VITE_NEON_AUTH_URL}/get-session` (Better Auth's standard session endpoint, exposed by Neon Auth's hosted service).
- **Env var (single):** `VITE_NEON_AUTH_URL` — the Auth Base URL from Neon Console, e.g. `https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth`. Browser-exposed via `import.meta.env`; server reads it via `process.env.VITE_NEON_AUTH_URL`.
- **Removed env:** `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## Schema changes

**Drop:**

- `users`, `sessions`, `accounts`, `verifications` tables and their drizzle relations.

**Add:**

- `neon_auth.user` — external, Neon-managed; declared in drizzle for typed reads only; never touched by migrations (drizzle-kit `schemaFilter: ["public"]`).
- `user_profiles` (app-owned):
  - `user_id text` PRIMARY KEY — logical ref to `neon_auth.user.id` (no hard FK; cross-schema FKs to a Neon-managed table are brittle).
  - `household_id integer NOT NULL REFERENCES households(id)`.
  - `created_at timestamp DEFAULT now() NOT NULL`.
  - No `display_name` column — Neon's client SDK supports `authClient.updateUser({ name })`, so names live in `neon_auth.user.name`.

**Column introspection caveat:** Neon's v0.2 docs do not publish the `neon_auth.user` column list. Implementation introspects columns via `information_schema` after Neon Auth is enabled and declares the drizzle table to match. Expected columns (from Better Auth defaults): `id text PK`, `email text`, `email_verified boolean`, `name text`, `image text`, `created_at timestamptz`, `updated_at timestamptz`. Actual shape is verified at Task 2.

**FK rewiring:**

Every table that currently references `users.id` (e.g. `recipes.created_by_id`, `cook_log.cooked_by_id`) becomes a plain `text` column with no hard FK. The app enforces the invariant that these ids exist in `user_profiles` (and therefore in `neon_auth.user`) via `requireProfile`.

## Server layer

**Remove:**

- `src/server/auth/` directory (all Better Auth server config).
- Any `/api/auth/*` route handler mounting Better Auth.
- `src/lib/auth.server.ts`, `src/lib/auth.functions.ts`.
- `better-auth` as a **direct** dependency in `package.json` (it remains transitively via `@neondatabase/neon-js`).
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` from `.env` / `.env.example`.

**Add:**

- `VITE_NEON_AUTH_URL` in `.env` / `.env.example`.
- `src/server/auth.ts` — `getSessionUser()`: reads the TanStack Start request, forwards its `Cookie` header to `${VITE_NEON_AUTH_URL}/get-session`, parses the Better Auth session JSON response, returns `{ userId, email, name } | null`.
- `src/server/profile.ts`:
  - `requireProfile(userId)`: returns `{ userId, householdId }`. Lazy-provisions a `user_profiles` row plus a new `households` row in a single transaction if the profile is missing.
  - `withProfile(fn)`: server-function wrapper that runs `getSessionUser` → `requireProfile` and passes `{ userId, householdId }` into the handler.

### Session endpoint contract

Better Auth's `/get-session` responds:

```json
{
  "user": { "id": "...", "email": "...", "name": "...", "image": null, ... },
  "session": { "id": "...", "userId": "...", "expiresAt": "...", ... }
}
```

or `null` (HTTP 200 with null body) if no valid session cookie. `getSessionUser()` treats network errors, non-200 responses, and null bodies identically → returns `null` (unauthenticated). This mirrors Better Auth's own server-side `auth.api.getSession(headers)` which we cannot use directly because we don't own the auth server instance.

**Route guard:** `src/routes/_app.tsx`'s server-side check uses a new `getAppSession` server function that calls `getSessionUser()` + `requireProfile()`. Unauthenticated → redirect to `/sign-in`.

## Lazy provisioning

On first authenticated request per user:

1. `SELECT * FROM user_profiles WHERE user_id = $1`.
2. If present → return it.
3. If missing → in one transaction:
   - `INSERT INTO households (name) VALUES ('My Household') RETURNING id`.
   - `INSERT INTO user_profiles (user_id, household_id) VALUES ($1, $newHouseholdId) ON CONFLICT (user_id) DO NOTHING`.
   - If the insert affected zero rows (concurrent request won the race) → `DELETE FROM households WHERE id = $newHouseholdId` and re-`SELECT` the existing profile.
4. Return `{ userId, householdId }`.

## Client layer

Replace `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "@neondatabase/neon-js/auth"
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react"

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL,
  { adapter: BetterAuthReactAdapter() },
)
```

Call-site changes across `src/routes/sign-up.tsx`, `src/routes/sign-in.tsx`, `src/routes/_app.tsx`, `src/routes/_app/settings.tsx`:

| Current (Better Auth local)                         | Replacement (Neon Auth)                            |
|-----------------------------------------------------|-----------------------------------------------------|
| `authClient.useSession()`                           | `authClient.useSession()` (same name; different pkg) |
| `authClient.signUp.email({ name, email, password })`| `authClient.signUp.email({ name, email, password })` |
| `authClient.signIn.email({ email, password })`      | `authClient.signIn.email({ email, password })`       |
| `authClient.signOut()`                              | `authClient.signOut()`                               |
| `authClient.updateUser({ name })`                   | `authClient.updateUser({ name })`                    |

The API surface is identical (both are Better Auth clients); only the import path and the created client's base URL change. The provider wrapper (`NeonAuthUIProvider`) is added at the app root only if we adopt Neon's prebuilt UI components (we are **not** — we keep the existing custom sign-in/sign-up forms).

## Seeding

Neon Auth v0.2 does **not** expose an admin `createUser` API. Options:

1. **Manual once:** developer signs up via the app UI once, copies the resulting id from `neon_auth.user`, and exports it as `SEED_USER_ID`. `seed:reset` requires this env and fails fast without it.
2. **Programmatic via `signUp.email`:** seed script calls `authClient.signUp.email(...)` over HTTP to create a demo user. Requires the auth URL to accept sign-ups and adds an extra HTTP dep to the seeder.

**Chosen:** option 1 (simpler; sign-up is a one-time manual step per dev branch).

## Rollout

Single branch, atomic PR:

1. Enable Neon Auth in the Neon console; capture `VITE_NEON_AUTH_URL`.
2. Introspect `neon_auth.user` columns; declare drizzle table to match.
3. Drizzle schema changes (`user_profiles`, drop local auth tables); `pnpm db:generate` + `pnpm db:push`.
4. Add `src/server/auth.ts` (cookie-forwarding session resolver) and `src/server/profile.ts`.
5. Delete `src/server/auth/`, `src/lib/auth.server.ts`, `src/lib/auth.functions.ts`, `/api/auth/*` handler.
6. Swap the client SDK and rewrite call-sites.
7. Rewire server functions through `withProfile`.
8. Update `seed:reset` to require `SEED_USER_ID`.
9. Uninstall `better-auth` as a direct dep; install `@neondatabase/neon-js`; update env files.
10. Smoke-test: sign up → `/app` → household auto-created → create recipe → visible in `/recipes`.
11. Update Playwright e2e selectors if form fields changed.

Rollback is a single revert — no prod data at risk.

## Resolved (previously open) questions

- **Exact SDK package & API:** `@neondatabase/neon-js` — `createAuthClient` + `BetterAuthReactAdapter`. See notes file.
- **Admin create user:** not exposed. Seed requires `SEED_USER_ID` env pointing at a manually-created user.
- **`updateUser({ name })` support:** yes, client-side; no `user_profiles.display_name` column needed.
- **Server-side session validation for Vite/TanStack Start:** cookie-forwarding to Neon Auth's `/get-session` endpoint.
- **Table name:** `neon_auth.user` (singular), not `users_sync` (that was v0.1 Stack Auth).
