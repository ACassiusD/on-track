# Initial native slice validation — September 30, 2026

## Passed

- `npm run typecheck` — TypeScript, no errors.
- `npm run lint` — Expo/ESLint, no errors or warnings.
- `TZ=America/Toronto npm test` — 9/9 domain tests passed.
- `npm test` — 9/9 domain tests passed under execution environment timezone.
- `EXPO_OFFLINE=1 npx expo export --platform ios` — Metro compiled 1,255 modules into an iOS Hermes JS bundle. This validates bundling, not an iOS binary or device behavior.
- `EXPO_OFFLINE=1 npx expo install --check` — bundled SDK compatibility table reports dependencies up to date.
- `npm ls --depth=0` — direct dependency tree resolves successfully.

## Tooling notes

Project generated using `npx create-expo-app@latest ... --template blank-typescript --no-install --yes` and official SDK 57 versioned documentation. Initial requested folder name `react-native` was rejected as a dependency name; generated under `on-track-native` and renamed the folder. Package name remains `on-track-native`.

Online Expo compatibility lookup timed out via the environment proxy; retried with Expo offline mode, which resolves versions from the installed SDK's bundled compatibility table. Online React Native Directory checks were unavailable. Transitive optional dependencies initially picked newer react-dom/worklets versions; explicit SDK-compatible versions added with `expo install` resolved these conflicts. No `--force` or `--legacy-peer-deps` used. Lockfile included.

Node warns about inferred ES module type when running the domain .ts tests; tests pass. Environment emits npm proxy config and NO_COLOR warnings. No user data, secrets, cloud accounts, or remote writes involved.

## Not tested / not implemented

No macOS/Xcode/iOS Simulator or physical iPhone execution. No native binary built, installed, or signed. No UI screenshot/device visual QA, VoiceOver, larger-font layout, system photo picker, native file persistence, app background/relaunch persistence, widget extension, permissions or notification delivery tested.

State serialization/migration tests pass, but actual AsyncStorage hydration and ordered writes still need device integration tests. Source reconciliation tests cover weight identity replacement only; nutrition import remains intentionally unavailable.

HealthKit, AlarmKit, widgets, App Intents, Live Activities, and AI remain future adapters. Actionable local iPhone reminders now have implementation code, but actual delivery, permission prompts, foreground/background/terminated startup responses and system queue limits have not been device-tested. Photos use side-by-side, flip, or fixed-opacity overlay; the reference scrub slider isn't implemented yet. Milestone awards and richer status aggregation need settled rules. No claim of all-screen fit or pixel-perfect port; dashboard uses scrolling and native text scaling.

## Actionable reminders slice — September 30, 2026

Opt-in weekday/weekend local schedules, explicit same/previous-day mapping, permission/status UI, saved-state serialization, 14-day bounded refill, Taken/Done dated actions, food-audit routing, twice-bounded 30-minute snooze, cancellation on resolution/settings/demo, startup response handling and persisted deduplication implemented. Native calls run through a serial queue and read the authoritative persisted store; failed persistence does not apply the change. No server, APNs token or cloud account required.

Passed fresh typecheck and lint; 19/19 domain tests under America/Toronto and execution timezone, including planner, DST spring gap, midnight snooze identity, known No, confirmed versus incomplete food, stale responses, idempotent completions and queue reconciliation. The tests exercise pure domain behavior rather than mocking away native delivery. Fresh `EXPO_OFFLINE=1 npx expo export --platform ios` passed (1,317 modules, Hermes JS bundle; not an iOS binary). `EXPO_OFFLINE=1 npx expo install --check` reported dependencies up to date using the installed SDK compatibility table.

Still requires physical iPhone tests: permission denied/re-enabled, app foreground/background/terminated response, duplicate callback delivery, rapid edits against schedule synchronization, midnight/weekend/DST fall-back timing, system Focus, and real notification cancellation. Habit buttons intentionally foreground the app to run the shared persisted JS actions reliably; they do not promise background execution when JS is stopped. No AlarmKit or critical-alert behavior. Scheduling expires without app reopening after the 14-day horizon.
