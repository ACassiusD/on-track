# Backend and testing plan

## Status

The native app currently persists data locally. No cloud sync or Supabase connection is implemented. Local reminders are implemented for iPhone and await actual device delivery testing.

## Supabase milestone

Create a dedicated ON TRACK project after the owner selects the organization and confirms the quoted cost. Do not reuse or mutate unrelated existing project databases.

- Auth: an optional account for backup and sync; daily logging remains usable offline.
- Postgres: per-user preferences, dated daily records, immutable confirmations/revisions, weight readings, and photo metadata. Ownership policies on every exposed table; no data access across users by default.
- Storage: private photo bucket with owner-restricted paths; photos stay local until cloud backup is explicitly enabled.
- Sync: durable local outbox, stable IDs, idempotent writes, explicit conflict handling, deletions/tombstones, and status visible to the user. Food imports never prove completeness. Preserve revisions across devices.
- Edge Functions later: authenticated AI requests with secrets server-side. Accountability sharing requires a separate explicit access model and preview.

Before implementation: verify current Supabase docs, commit versioned schema migrations and generated types, and test ownership policies with two accounts. The app may contain only its project URL and publishable key. Secret/service-role keys must never be shipped in the client or committed.

## Windows development

Use an Android emulator for shared React Native screens, local storage, charts, calendar, and domain flows. Use a physical iPhone for iOS layout and notifications. Apple Health, WidgetKit, AlarmKit, and Live Activities need iOS native development builds and device testing; Android results cannot validate them. The iOS Simulator requires macOS.

No Android reminder implementation or emulator/device validation is claimed yet.
