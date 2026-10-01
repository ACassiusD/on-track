# ON TRACK optional cloud backend

Dedicated project: `teqocbxdkdoiwzqwcqsi`, Canada Central. This slice uses user-controlled email/password auth and explicit private record snapshots. No continuous sync/outbox is claimed.

## Implemented and deployed

- `public.on_track_backups`: immutable versioned JSON real-mode records, per-owner SELECT/INSERT/DELETE, no UPDATE. Explicit authenticated grants and RLS; anonymous access revoked.
- `on-track-private-photos`: private storage bucket with per-user first-folder policies. Frontend photo upload/restore is **not implemented**; current snapshots exclude photos/URIs. Bucket never exposes a public photo URL.
- `weekly-coach` Edge Function: validates bearer sessions with Supabase `getUser`, accepts only bounded real-mode aggregate facts, rejects prompts/demo/photos, requires server `OPENAI_API_KEY` and `OPENAI_MODEL`, uses Responses `store:false` and max 400 output tokens. No OpenAI secrets are configured in source or client; without server secrets it responds 503 after auth/format checks, before quota or OpenAI work.
- Persistent five-attempt-per-user-per-UTC-day quota. Private table denies direct access; private SECURITY DEFINER function deliberately needed to prevent counter resetting, with explicit `auth.uid()` guard, empty search path, no owner/count parameters. Public invoker RPC is granted only to authenticated users. Requests that reach OpenAI consume an attempt even if upstream fails.

Migration files were created via `supabase migration new`, applied to the remote dedicated project through the Supabase connector, then filenames aligned to the actual recorded remote migration versions. No local Docker/Postgres environment was available; no pretend local db pull was used. Reapply via normal migration workflow only to a fresh project. Do not rerun already-applied SQL manually.

## App integration

Mount `CloudStore` inside `AppStore`; route `/account`. Account supports sign in/create account/sign out, Backup now, list/delete immutable snapshots, preview/confirm restore and last local recovery preview. Real-mode data only. Never performs automatic upload on sign in or local edits. Restore refuses changes since preview, saves previous records locally before replacement, preserves device photos, reminders/theme, demo records and native response receipts.

Session tokens are stored in Expo SecureStore/Keychain, split into small generation-based chunks to avoid historical large-value limits. Manifest commit happens after chunks, failed replacement retains the prior session. No plaintext token AsyncStorage fallback. Cloud account intentionally unavailable in web preview. API URL/publishable key are safe public config, not service-role keys.

Cloud operations use a 25-second network timeout. Pending/errors are visible, local records remain usable offline. Failed backup needs explicit retry; no automatic outbox. Supabase email provider confirmation/restrictions still apply; follow confirmation email and return to password sign-in. No email was sent or real user account created during development tests.

`useCloud().requestReview(facts)` is only for an explicit user-consented AI request. UI must show exactly what will be sent first. A deployment exists but actual OpenAI generation requires operator setup in the Supabase server-secret UI; never paste secrets into chat, client code, EXPO_PUBLIC variables or logs. If configured later, ensure the chosen model supports Responses/max_output_tokens and account limits.

## Verification completed

- Actual database owner/cross-owner SELECT/INSERT/DELETE and snapshot UPDATE denial under `authenticated`; anonymous snapshot read denial.
- Actual private-photo metadata insert ownership/isolation tests.
- Actual DB quota allows five, denies sixth, isolates owners and refuses client reset/anonymous invocation.
- All SQL fixtures use generated IDs and roll back, including synthetic auth rows. No test accounts or objects retained.
- Security advisors: clean after explicit-deny policy.
- Deployed endpoint without Authorization returns 401 `Sign in first`; no quota/OpenAI request.
- Pure tests: real/demo/photo exclusion; invalid versions/dates; restore conflict/preserved device fields; secure-session chunk size/rollback; coach malformed/auth/demo/config/quota gates and REST text extraction.

## Still requires real testing

No physical iPhone auth, Keychain restore/sign-out, email confirmation, network loss, backup REST roundtrip with a genuine authenticated session, or authenticated OpenAI call. SQL RLS tests are not end-to-end app auth tests. No OpenAI key was available and no paid AI request was made. Photo upload/download, automatic sync, merge conflicts, account deletion and password reset flows are future work. Restore replaces records only after explicit preview; it does not merge two devices. Last local recovery is one unencrypted device snapshot, consistent with the existing local store.

Useful files: `supabase/tests/ownership.sql`, `supabase/tests/coach-quota.sql`, `tests/cloud.test.mjs`. Node mobile typecheck excludes only Deno's deployed entrypoint; its shared handler is covered by mobile TypeScript/tests. Deployment compilation validates Deno source, but no local Deno binary was available.
