# ON TRACK — native starter

**Stay on track. Stay motivated.**

A native React Native + TypeScript iPhone starter, built from the approved Neon Arcade dashboard. Uses Expo Router and Expo SDK 57 (stable official blank template); no WebView. Real mode starts empty with no calorie target. Four themes are selectable in Settings.

## Run

Node 22.13+ is required by SDK 57. From this directory:

```sh
npm ci
npm start
```

Scan with the SDK-compatible Expo Go app for this local slice, or run `npm run ios` on a Mac with the iOS Simulator. HealthKit, AlarmKit, widgets, and Live Activities will require a later development build/native extensions; they are **not implemented**. No cloud account or backend is needed for the current slice. Use Settings → Demo mode to see clearly separated illustrative records. Set your own targets in personal mode.

## Included

- Prominent calorie bar, seven-day average weight chart, previous/current calendar week.
- Workout/creatine Yes/No prompts hide after either answer; Edit checks restores them.
- Day detail with four independent checks and explicit unknown results.
- Calorie editing (today/yesterday), short food audit, immutable confirmation/revision history.
- Private system photo picker, persistent local original copies, timeline, side-by-side/flip/opacity overlay, uniform alignment. No photos are uploaded.
- Manual weights, goals/milestones config, four themes, opt-in actionable local iPhone reminders.
- AsyncStorage durable state with isolated demo/real data and a startup hydration gate.

## Validation

```sh
npm run typecheck
npm run lint
npm test
TZ=America/Toronto npm test
npx expo export --platform ios
```

The tests cover scoring, partial totals, revisions, fixed calendar windows/month/year changes, DST and midnight, empty real-mode serialization, and weight sample source deduplication. See VALIDATION.md for actual executed results.

## Important next work

This is an initial local slice, not a device-tested release or a pixel-perfect finished port. Check iPhone layout, VoiceOver, larger text, contrast, and keyboard behavior on real hardware. The dashboard scrolls rather than clipping; no promise all cards fit every iPhone/text-size combination. Touch targets are at least 44 points.

Settings → Reminders saves weekday/weekend times and the intended same/previous day, requests iOS permission explicitly, and reports scheduled alerts/errors. Taken/Done invokes dated shared business actions; food reminders open the existing audit without auto-confirming. Later snoozes 30 minutes, at most twice per alert. All reminders default off and demo mode cancels real alerts. A rolling finite 14-day delivery queue is refilled on app open/foreground/day change and preference/data updates: reopen at least every two weeks. Schedule horizon refers to delivery only; the dashboard remains fixed previous/current weeks. Ordinary notifications can be silenced by Focus. Startup responses are handled after hydration/navigation readiness; durable bounded IDs deduplicate repeated callbacks. Permissions, delivery, terminated-app actions and actual iOS queue behavior still need real-device testing. Nutrition import/reconciliation needs a dedicated source-overlap spike; imported totals must never prove completeness. Weight upsert supports source IDs; Apple Health isn't connected.

Photos are app-private copies but not separately encrypted. OS backup policy, app lock, photo removal/export, backup/recovery, and secure deletion need production design. Daily photo review dates are stored independently of food confirmation. Photo overlay is opacity-based; scrub slider/automatic alignment/guided camera capture remain future work.

Targets apply to new daily records; existing days (including today once recorded) retain their saved target. Calorie edits support today/yesterday only; extend the date picker for earlier corrections. Goal/milestone settings are present, but milestone awards wait for an agreed coverage rule. Native animation/haptics/game polish, status aggregation, and richer stats remain future slices. No fabricated XP or health score.

State storage is unencrypted local JSON. Parse failure preserves the original saved data and blocks edits to avoid overwriting it; a recovery/export UI is still needed. A save failure is shown in-app, with retry on the next change. No automated React/native interaction tests or on-device persistence checks have been run.

## Source map

- `src/domain/model.ts`: pure records, dates, score, calories/confirmation/revision actions, weight trend and source identity.
- `src/store/AppStore.tsx`: hydration, ordered persistence, foreground/day-change handling, real/demo separation.
- `src/app/`: native Router screens.
- `src/components/`: shared controls, palettes, trend chart.
- `src/domain/reminders.ts`: pure dated planner, snooze and reconciliation rules.
- `src/native/localReminders.ts`: Expo iOS permission, categories and notification queue adapter.
- `src/store/ReminderStore.tsx`: serialized scheduling, foreground refresh and deduplicated response handling.
- `src/native/capabilities.ts`: implementation boundaries; reminder status lives in Reminders.

Business actions must be shared by widgets/native adapters. Do not create an independent widget calorie total or auto-confirm food on import. Before adding native APIs, read docs/IOS-FEATURE-PLAN.md and the SDK-specific docs referenced by AGENTS.md.

Official tooling/docs checked: https://docs.expo.dev/get-started/create-a-project/ and https://docs.expo.dev/versions/v57.0.0/ . All dependencies should be added with `npx expo install` for compatible versions.

## Design and planning

- [Coding handoff](docs/CODING-AGENT-HANDOFF.md)
- [iOS feature plan](docs/IOS-FEATURE-PLAN.md)
- [Theme references](design/) (illustrative HTML, not production screens)
