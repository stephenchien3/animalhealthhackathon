# Authentication — CleanFeed

## Overview

CleanFeed uses **Supabase Auth** with email/password sign-in. No OAuth providers. Authentication is handled entirely client-side via the Supabase JS client, with Row Level Security (RLS) policies enforcing data access on the database.

---

## Environment Setup

Add these to your `.env` file (see `.env.example`):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The Supabase client is initialized in `src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## `useAuth` Hook

Located at `src/hooks/useAuth.ts`. Provides:

| Method / Property | Description                                      |
|-------------------|--------------------------------------------------|
| `session`         | Current Supabase `Session` or `null`             |
| `loading`         | `true` while initial session is being fetched    |
| `signIn(email, password)` | Sign in with email/password, returns `{ error }` |
| `signOut()`       | Signs out the current user                       |

### How it works

1. On mount, calls `supabase.auth.getSession()` to restore any existing session
2. Subscribes to `supabase.auth.onAuthStateChange()` to react to login/logout events
3. Cleans up the subscription on unmount

```typescript
const { session, loading, signIn, signOut } = useAuth();
```

---

## Protected Route

Wrap authenticated routes with a `ProtectedRoute` component:

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

Usage in `App.tsx`:

```tsx
<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
  <Route path="/" element={<HomePage />} />
  <Route path="/summary" element={<SummaryPage />} />
  {/* ... */}
</Route>
```

---

## Login Page

The login page follows the **Veil login** pattern:

- Centered layout: `flex min-h-screen items-center justify-center`
- Container: `max-w-sm space-y-6`
- Title + subtitle at top
- Email + password fields using standard form pattern
- Full-width primary "Sign in" button
- Error message displayed above form when auth fails

Located at `src/pages/LoginPage.tsx`.

---

## Row Level Security (RLS)

RLS policies ensure users can only access data belonging to their corporation.

### User → Corporation mapping

Each Supabase Auth user has a `corporation_id` stored in their JWT metadata (set during user creation via Supabase dashboard or admin API):

```sql
-- Access the user's corporation_id from their JWT
auth.jwt() ->> 'corporation_id'
```

### Policies

#### `sheds` table

```sql
-- Users can only SELECT sheds belonging to their corporation
CREATE POLICY "Users can view own corporation sheds"
  ON sheds FOR SELECT
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

-- Users can only INSERT sheds for their corporation
CREATE POLICY "Users can create sheds for own corporation"
  ON sheds FOR INSERT
  WITH CHECK (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

-- Users can only UPDATE sheds belonging to their corporation
CREATE POLICY "Users can update own corporation sheds"
  ON sheds FOR UPDATE
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);

-- Users can only DELETE sheds belonging to their corporation
CREATE POLICY "Users can delete own corporation sheds"
  ON sheds FOR DELETE
  USING (corporation_id = (auth.jwt() ->> 'corporation_id')::uuid);
```

#### `corporations` table

```sql
-- Users can only view their own corporation
CREATE POLICY "Users can view own corporation"
  ON corporations FOR SELECT
  USING (id = (auth.jwt() ->> 'corporation_id')::uuid);
```

#### `sensor_readings` table

```sql
-- Users can view readings for sheds in their corporation
CREATE POLICY "Users can view own corporation sensor readings"
  ON sensor_readings FOR SELECT
  USING (
    shed_id IN (
      SELECT id FROM sheds
      WHERE corporation_id = (auth.jwt() ->> 'corporation_id')::uuid
    )
  );
```

---

## Auth Flow

```
1. User visits any route
2. ProtectedRoute checks session via useAuth()
3. If no session → redirect to /login
4. User enters email + password → supabase.auth.signInWithPassword()
5. On success → session stored, redirect to /
6. All Supabase queries automatically include the JWT
7. RLS policies filter data to the user's corporation
8. On logout → supabase.auth.signOut() → redirect to /login
```

---

## Creating Test Users

Via the Supabase dashboard or CLI:

```bash
# Create a user with corporation_id in metadata
supabase auth create-user \
  --email test@example.com \
  --password testpassword123 \
  --data '{"corporation_id": "your-corporation-uuid"}'
```

Or via the Supabase dashboard: Authentication → Users → Add User → set `raw_user_meta_data` to include `corporation_id`.
