# ON TRACK

**Stay on track. Stay motivated.**

An iPhone-first React Native accountability app built with Expo SDK 57, Expo Router and TypeScript. Neon Arcade is the default theme. The shared screens also run on Android; Apple integrations require an iPhone development build.

## Run

Use Node 24 and the committed lockfile:

```sh
git clone https://github.com/ACassiusD/on-track.git
cd on-track
npm ci
npm start
```

On Windows, use an Android emulator for shared-screen testing. Expo Go supports the manual flows; HealthKit, widgets, Siri, Live Activities and AlarmKit require a development build. See [device setup](docs/DEVICE-SETUP.md). No cloud account is required for local tracking. Real mode starts empty, with no calorie target; demo data is isolated.

## Implemented

- Prominent daily calorie total and bar, seven-day weight trend, fixed previous/current Monday–Sunday calendar.
- Four independent checks: workout, creatine, complete food log, and calories within the saved target. Missing data stays unknown. Top habit prompts disappear after an answer and can be corrected.
- Daily totals without duplicating MyFitnessPal's food database. Explicit snack/drink audit, earlier-date corrections, immutable confirmation and revision history. Imported totals never prove completeness.
- Progress over 28/90/all days, measured-day coverage, trend-based checkpoints, consistency and correction summaries. Checkpoints need at least four weigh-ins in the seven-day window.
- Private local photo copies, daily review, timeline, side-by-side/flip/scrub comparison, uniform scale/position alignment, explicit original export and app-copy deletion. No body reshaping or automatic landmark alignment.
- Four themes and reduced-motion-aware feedback. Factual local coaching and explicitly previewed progress sharing.
- Opt-in weekday/weekend reminders, intentional overnight date mapping, habit actions and bounded snooze. Finite 14-day schedules refill when the app runs.
- Optional Supabase accounts with Keychain-backed sessions, explicit versioned backups, previewed conflict-safe restore and local recovery. Photos remain local; this is manual backup, not automatic synchronization.
- Read-only HealthKit preview/import, Home/Lock Screen widgets, Siri habit shortcuts with durable receipts, an explicit evening Live Activity, and one-off iOS 26 AlarmKit alerts. See [native implementation and limits](docs/IPHONE-NATIVE.md).
- Optional authenticated AI review endpoint with consent, bounded factual input and daily quota. Generation remains disabled until server-side OpenAI secrets are configured.

## Validation and remaining work

Typecheck, lint and 46 domain/contract tests pass in UTC and America/Toronto. iOS/Android JavaScript exports and isolated iOS project generation are checked separately from native compilation. See [executed validation](VALIDATION.md).

This is implemented source, not a device-tested release. The GitHub iOS workflow attempts an unsigned simulator build; physical iPhone testing and Apple provisioning are still required. Health permission/source behavior, Siri discovery, widgets, AlarmKit, Live Activities, notification delivery, Keychain/auth and photo gestures need hardware verification. Dashboard content scrolls on small screens or larger text.

No automatic background Health sync, cloud photo backup, direct background widget actions, recurring AlarmKit schedule, APNs service or permanent XP awards are claimed. Local JSON and photo copies are app-private but not separately encrypted.

## Development

```sh
npm run typecheck
npm run lint
npm test
TZ=America/Toronto npm test
npx expo export --platform ios --platform android
```

Add Expo dependencies with `npx expo install`. Read [AGENTS.md](AGENTS.md) before changes. Generated native projects are produced through config plugins; do not edit generated iOS files directly.

## Documentation

- [Device setup](docs/DEVICE-SETUP.md)
- [iPhone integrations](docs/IPHONE-NATIVE.md)
- [Backend implementation](supabase/README.md)
- [Coding handoff](docs/CODING-AGENT-HANDOFF.md)
- [iOS feature plan](docs/IOS-FEATURE-PLAN.md)
- [Original theme references](design/) — illustrative HTML, not production screens
