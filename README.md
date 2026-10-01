# ON TRACK

**Stay on track. Stay motivated.**

An iPhone-first React Native accountability app built with Expo SDK 57, Expo Router and TypeScript. Default is the standard theme. The shared screens also run on Android; Apple integrations require an iPhone development build.

## Run

Use Node 24 and the committed lockfile:

```sh
git clone https://github.com/ACassiusD/on-track.git
cd on-track
npm ci
npm start
```

The start, iOS, Android and web scripts use port **8095**, keeping this project separate from other Metro servers. Restart the server after pulling this change. For native builds, use `npx expo run:ios --port 8095` or `npx expo run:android --port 8095`.

On Windows, use an Android emulator for shared-screen testing. Expo Go supports the manual flows; HealthKit, widgets, Siri, Live Activities and AlarmKit require a development build. See [device setup](docs/DEVICE-SETUP.md). No cloud account is required for local tracking. Real mode starts empty, with no calorie target; demo data is isolated.

For standalone iPhone testing with automatic updates from main, see [iPhone test updates](docs/IPHONE-TEST-UPDATES.md).

## Welcome guide

New users get a five-slide, skippable introduction with animated pet mood previews, the five daily tasks, happiness criteria, missed-day guidance and a shortcut to guided goal setup. Completion is saved locally. Existing users can replay it under **Settings → App & pet guide**; the development hard reset makes it appear on first launch again. Mood previews do not change records or the real pet score.

Today labels the daily tasks with a completion count. Finishing all five collapses them into **All done for today!**; **View tasks** reopens them for corrections. Each newly completed task plays a short, queued pet reaction (dumbbell, creatine scoop, calorie checklist, scale or target shield), followed by a trophy celebration at 5/5. These reactions briefly override the expression and idle movement, then return to the actual 14-day mood. Loading saved data, switching demo profiles and midnight do not replay celebrations; reduced motion shows a static reaction instead.

Tap the pet on Today to open its detail modal: a larger animated pet, the reason for its mood, daily completion, 14-day consistency, a habit tip and the next milestone. Tap the larger pet for an affection reaction. Habit breakdowns are expandable; this adds no XP or permanent levels yet.

Goal setup asks one question at a time: calorie target, goal weight, optional milestones, then weigh-in time. Milestones are added individually; settings save together at the end. Existing readings stay unchanged when selecting kg or lb.

## Implemented

- Prominent daily calorie total and bar, seven-day weight trend, fixed previous/current Monday–Sunday calendar.
- Four independent checks: workout, creatine, complete food log, and calories within the saved target. Missing data stays unknown. Top habit prompts disappear after an answer and can be corrected.
- Daily totals without duplicating MyFitnessPal's food database. Simple daily total and Food logged check, earlier-date corrections, immutable confirmation and revision history. Imported totals never prove completeness.
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

## Dashboard update

Today, Photos and Settings use bottom tabs. Add/Edit weight is on the dashboard; manual entries record a time and default to the configurable 14:00 preference. The weight chart shows an empty grid, then a first reading, then the seven-day average line. Calories open a single total field with Save and a Food logged check; history is collapsed. Editing the total reopens the food check and retains corrections.

## Task calendar and retro theme

The five calendar tasks are Workout, Creatine, Calories logged, Weight entered and Calories within target. A finished over-target log still earns calorie logging completion; staying within target earns a separate check. Weight entry opens a modal. Arcade Pop uses bitmap lettering, squared neon frames, a CRT grid and a pixel buddy. Settings → Demo mode offers Good, Mixed, Bad and New profiles; choosing a profile replaces demo data only.
