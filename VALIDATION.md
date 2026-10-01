# Implementation validation — October 1, 2026

## Passed locally

- TypeScript typecheck and Expo lint, no errors.
- 46/46 tests in the execution timezone and America/Toronto. Coverage includes calorie completeness/scoring, revisions, fixed weeks/DST/midnight, progress coverage and gaps, cloud snapshot validation, secure session chunks, consent/auth/quota gates, native projections, durable receipt actions and reminder reconciliation.
- Expo SDK compatibility check reports dependencies up to date using the installed SDK's offline compatibility table. Online lookup was unavailable.
- Isolated iOS prebuild and native module autolinking: generated app includes Siri source, HealthKit/App Group entitlements and usage descriptions; widget target includes the expected families and shared App Group. This validates generation, not Swift compilation.
- Supabase owner/cross-owner backup and private-photo policies, plus five-per-UTC-day AI quota, tested with synthetic fixtures and rollback. Security/performance advisors reported no findings. Deployed unauthenticated AI request returns 401. No OpenAI paid call made.

- Final integrated `EXPO_OFFLINE=1 npx expo export --platform ios --platform android` passed: iOS 1,493 modules (3.8 MB Hermes bundle), Android 1,616 modules (4 MB). This is bundling validation, not a native binary.

## Pending native and runtime checks

No signed iPhone app has been built or installed in this environment. No Xcode/Swift compilation or simulator execution has been completed locally. The committed GitHub Actions macOS workflow attempts an unsigned iOS simulator build; its result must be checked separately.

Physical-device tests remain for permission prompts/denial, Health source reconciliation, Siri discovery and terminated-app receipt handling, widget serialization/refresh, Live Activity lifecycle, AlarmKit delivery/cancellation, local notifications under Focus, Keychain/account backup roundtrip, photo persistence/gestures/export/deletion, VoiceOver and large text. JavaScript bundles and pure tests do not establish these behaviors.

AI generation is deliberately unavailable until server-side OPENAI_API_KEY and OPENAI_MODEL are configured. Cloud backups are explicit snapshots; local photos are excluded. Health reads are bounded previews, not background anchored synchronization. AlarmKit is one-off. Widgets deep-link for edits rather than claiming background direct habit actions. Live Activity stale dates do not guarantee timed background termination.

## Dashboard usability revision

Typecheck, lint and 49 tests pass. Added daily manual-weight correction, date/time validation and legacy preference migration tests. Web export passes after bottom-tab routing changes. Native visual/device validation remains pending. Weigh-in time defaults to 14:00 and is recorded independently from the source observation timestamp.
