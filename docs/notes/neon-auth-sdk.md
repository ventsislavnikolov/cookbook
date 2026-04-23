# Neon Auth — SDK notes

## Actual URLs read

- `https://neon.com/docs/auth/overview` — overview, framework links
- `https://neon.com/docs/auth/quick-start/react` — Vite/React quick start (✓)
- `https://neon.com/docs/auth/quick-start/tanstack-router` — TanStack Router quick start (✓)
- `https://neon.com/docs/auth/quick-start/nextjs-api-only` — Next.js server SDK (✓)
- `https://neon.com/docs/auth/reference/nextjs-server` — Next.js server SDK reference (✓)
- `https://neon.com/docs/auth/reference/ui-components` — React UI components reference (✓)
- `https://neon.com/docs/reference/javascript-sdk` — JS/TS client SDK reference (✓)
- `https://neon.com/docs/guides/neon-auth` — migration guide: Stack Auth → Better Auth (✓)
- `https://neon.com/docs/auth/migrate/from-auth-v0.1` — v0.1 → v0.2 migration (✓)
- `https://neon.com/docs/auth/authentication-flow` — auth flow overview (✓)
- `https://neon.com/docs/auth/branching-authentication` — branching auth (✓)
- `https://neon.com/docs/auth/quick-start` — 404 (does not exist)
- `https://neon.com/docs/auth/api` — 404 (does not exist)
- `https://neon.com/docs/auth/components` — 404 (does not exist)

## Context: Neon Auth is NOT Stack Auth

Neon Auth has two generations:

- **v0.1 (legacy / "Neon Auth SDK")** — built on Stack Auth (`@stackframe/stack`). Used
  `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`,
  `STACK_SECRET_SERVER_KEY`. **Deprecated.**
- **v0.2 (current / "Neon Auth with Better Auth")** — built on Better Auth. Uses
  `@neondatabase/neon-js` (React/Vite) or `@neondatabase/auth` (Next.js server SDK).
  This is what the migration targets. Currently in **Beta**.

The plan template's env var names (`NEXT_PUBLIC_STACK_*`, `STACK_SECRET_SERVER_KEY`) are from
the **old v0.1 SDK** and must NOT be used. See "Environment variables" section below for the
correct names.

## Packages

### React / Vite client (our stack)

- **Package:** `@neondatabase/neon-js` (version `0.2.0-beta.1`)
- **Install:** `npm install @neondatabase/neon-js@latest`
- **Key import paths:**
  - `@neondatabase/neon-js/auth` — `createAuthClient`
  - `@neondatabase/neon-js/auth/react` — `BetterAuthReactAdapter`, `NeonAuthUIProvider`
  - `@neondatabase/neon-js/auth/react/ui` — `AuthView`, `AccountView`, `SignedIn`,
    `SignedOut`, `UserButton`, `RedirectToSignIn`, `RedirectToSignUp`
  - `@neondatabase/neon-js/ui/css` — default CSS styles
  - `@neondatabase/neon-js/ui/tailwind` — Tailwind integration

### Next.js server SDK (NOT our stack — recorded for reference)

- **Package:** `@neondatabase/auth` (version `0.2.0-beta.1`)
- **Install:** `npm install @neondatabase/auth@latest`
- **Import:** `import { createNeonAuth } from '@neondatabase/auth/next/server'`

> NOTE: Our stack is Vite + TanStack Start, not Next.js. The `@neondatabase/auth` package's
> `createNeonAuth` is Next.js-specific (uses Next.js cookies/headers). For Vite/React we use
> `@neondatabase/neon-js` only. There is no documented server-side session helper for
> non-Next.js frameworks in the current v0.2 docs.

## Environment variables (exact names)

For **Vite/React** (our stack):

- `VITE_NEON_AUTH_URL` — the Auth Base URL from Neon Console, e.g.
  `https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth`
  (browser-exposed via `import.meta.env.VITE_NEON_AUTH_URL`)

For **Next.js server SDK** (not our stack, recorded for reference):

- `NEON_AUTH_BASE_URL` — same URL value, server-side only
- `NEON_AUTH_COOKIE_SECRET` — 32+ char secret for signing session cookies
  (generate: `openssl rand -base64 32`)

**Old v0.1 Stack Auth vars (deprecated, do not use):**

- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

## Client API (Vite/React — `@neondatabase/neon-js`)

### Setup

```typescript
// src/auth.ts
import { createAuthClient } from '@neondatabase/neon-js/auth';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react';

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL,
  { adapter: BetterAuthReactAdapter() }
);
```

### Auth operations

- **Sign up:**
  ```typescript
  authClient.signUp.email({ email, password, name })
  // optional: image?, callbackURL?
  // returns: { data: { user, session } | null, error }
  ```

- **Sign in:**
  ```typescript
  authClient.signIn.email({ email, password })
  // optional: rememberMe?, callbackURL?
  // returns: { data: { user, session } | null, error }
  ```

- **Sign in (OAuth):**
  ```typescript
  authClient.signIn.social({ provider, callbackURL? })
  // provider: 'google' | 'github' | 'vercel'
  ```

- **Sign out:**
  ```typescript
  authClient.signOut()
  ```

- **Current user / session hook:**
  ```typescript
  const { data } = authClient.useSession();
  // data: { session, user } | null
  ```
  > Note: `useSession()` is a method on the `authClient` instance (not a standalone import).
  > It requires the `BetterAuthReactAdapter` to be passed when creating the client.

- **Update user name:**
  ```typescript
  authClient.updateUser({ name: 'New Name' })
  // also accepts: image?: string | null
  // returns: { data, error }
  ```
  SUPPORTED — via `authClient.updateUser({ name })`.

- **Get session (async, non-hook):**
  ```typescript
  authClient.getSession()
  // returns: { data: { session, user } | null, error }
  ```

## Server API

### Session resolution from request (Vite/TanStack Start)

**NOT SUPPORTED via a documented helper.** The `@neondatabase/auth/next/server` package with
`createNeonAuth()` / `auth.getSession()` is Next.js-only (relies on Next.js `cookies()` /
`headers()`). No equivalent Vite/non-Next.js server helper is documented in the current v0.2
docs.

**Workaround options (not documented, inferred):**
1. Call `authClient.getSession()` client-side and pass user data via loaders.
2. Parse the Better Auth session cookie manually on the server using `better-auth` primitives.
3. Use the Neon Auth REST API (base URL + `/session` endpoint) with the cookie from the
   incoming request — undocumented, use with caution.

For reference, the Next.js server pattern:

```typescript
// Next.js only — NOT usable in TanStack Start/Vite
import { createNeonAuth } from '@neondatabase/auth/next/server';
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
const { data: session } = await auth.getSession();
```

### Admin create user

**NOT SUPPORTED** — no `createUser` / admin create user method is documented in either the
client SDK (`@neondatabase/neon-js`) or the server SDK (`@neondatabase/auth`). The admin API
exposes only:

- `auth.admin.listUsers({ limit, offset })`
- `auth.admin.banUser({ userId, reason })`
- `auth.admin.setRole({ userId, role })`

For seeding test users, the only documented path is:

```typescript
authClient.signUp.email({ email, password, name })
```

called programmatically (i.e., make an HTTP request to the auth handler endpoint).

## Database / Users table

### Schema and table name

- **Schema:** `neon_auth`
- **Table:** `user` (NOT `users_sync` as the plan template assumed)
- **Full qualified name:** `neon_auth.user`

The docs consistently reference `neon_auth.user` in SQL examples:

```sql
SELECT * FROM neon_auth.user;
```

Additional tables in `neon_auth` schema (from auth flow docs):
- `neon_auth.account`
- `neon_auth.session`
- `neon_auth.verification`

### Column definitions

**NOT FOUND IN DOCS.** No `CREATE TABLE` statement or column list is published in the Neon
Auth v0.2 documentation. The docs only confirm the table name and that it is queryable via
SQL.

The plan template's column list (`id text PK`, `email text`, `name text`, `raw_json jsonb`,
`created_at timestamptz`, `updated_at timestamptz`, `deleted_at timestamptz`) appears to be
from the **old v0.1 Stack Auth** `neon_auth.users_sync` table and should NOT be assumed
correct for v0.2.

To get the actual schema, run against the Neon database after enabling Neon Auth:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'neon_auth' AND table_name = 'user'
ORDER BY ordinal_position;
```

## UI Components (React)

Provider setup:

```tsx
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';

<NeonAuthUIProvider authClient={authClient}>
  {children}
</NeonAuthUIProvider>
```

Key components from `@neondatabase/neon-js/auth/react/ui`:

| Component | Purpose |
|---|---|
| `<AuthView pathname="sign-in">` | Sign-in form |
| `<AuthView pathname="sign-up">` | Sign-up form |
| `<AccountView>` | Account management |
| `<UserButton>` | User avatar/menu dropdown |
| `<SignedIn>` | Render children only when authenticated |
| `<SignedOut>` | Render children only when unauthenticated |
| `<RedirectToSignIn>` | Auth guard redirect |
| `<RedirectToSignUp>` | Sign-up redirect |

## Concerns for our Vite + TanStack Start stack

1. **No server-side session helper for non-Next.js.** The documented server SDK
   (`createNeonAuth`) is Next.js-only. Server-side auth guards in TanStack Start will require
   a custom approach (client-side session propagation or manual cookie parsing).

2. **Table name differs from plan template.** Table is `neon_auth.user`, not `neon_auth.users_sync`.
   Column schema is undocumented — must be introspected after Neon Auth is enabled.

3. **Beta status.** Both packages are at `0.2.0-beta.1`. API may change.

4. **`@neondatabase/auth` vs `@neondatabase/neon-js`.** Two separate packages with overlapping
   auth functionality. For Vite, use `@neondatabase/neon-js` only. The `@neondatabase/auth`
   package is Next.js-specific.

5. **Admin create user not supported.** Seeding must use `signUp.email()` via HTTP or the
   auth client directly.
