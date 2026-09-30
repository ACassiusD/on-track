# ON TRACK — modern iPhone feature plan

September 30, 2026. Default theme: Neon Arcade.

**Stay on track. Stay motivated.**
The two product pillars are ADHD-friendly follow-through and motivation through visible progress. The app helps make the next action obvious, remembers unfinished tasks, and preserves honest records. It is not a medical treatment claim. Keep this message in onboarding and the product brief rather than adding slogans to the stats dashboard.

## Platform baseline
Apple currently lists iOS 27 as its current iPhone release. Its Siri AI rollout does not automatically make arbitrary third-party app actions available. Build explicit, documented App Intents and test what the supported OS/device can actually run. These high-value capabilities largely predate iOS 27; novelty is not the selection criterion.

Prefer a broadly supported deployment target chosen after the current Expo/React Native native compatibility spike. Use availability checks for newer capabilities and retain ordinary in-app/manual flows. No native integration is implemented merely because a settings switch exists.

## Build order and specific experiences

| Priority | Capability | Experience for the user | Implementation and limit |
| --- | --- | --- | --- |
| First usable app | Local-first daily loop | Open app, answer workout/creatine once, see calories/weight/two-week history immediately; unfinished items remain remembered. | Durable records, explicit unknown states, revision history, late-night date choice, four themes. Works offline. |
| First native feature | Actionable reminders | A creatine reminder offers Taken / Later; workout offers Done / Later; food reminder offers Review food / Remind me later. | UserNotifications categories; direct habit actions are reversible. Food review opens the short audit rather than silently confirming all food. Snooze/reschedule locally; cancel resolved reminders for that day without disabling future days. Focus and system settings can delay/silence normal alerts. |
| First native feature | Interactive widgets | Home Screen: calorie total/bar, trend weight, unresolved habits; tap Taken or Done without hunting for the app. Lock Screen: one compact unresolved check or trend number. | SwiftUI WidgetKit + App Intents + shared App Group storage. Widgets have system refresh budgets, so show freshness/provisional state; arbitrary text entry opens the app. Layouts differ by widget family. |
| Next | Apple Health bridge | Import scale weight, dietary-energy totals from MyFitnessPal, and workouts from the existing workout app when those sources write to Health. | HealthKit permission + source-specific reconciliation. Imported calories stay unconfirmed until the user acknowledges completeness. MFP exports meal summaries but does not sync food timestamps; do not infer dinner completion. VeSync support depends on actual scale model and settings. No double-counting across sources. Manual fallback always available. |
| Next | Voice and system quick actions | Siri/Shortcuts: “I took creatine,” “I worked out,” “Open my food check,” “Set today's calorie total to 1,750.” Action button/Control Center shortcut opens the nightly review. | App Intents with precise dates, explicit set-versus-add semantics, confirmation/readback for totals, and undo/revision logging. Verify Siri phrases on-device; no promise that new Siri AI can inspect all app data without integration. |
| Optional opt-in | Real nightly alarm | A user-selected nightly alarm prompts a review before the usual 2 am bedtime. Unlike a regular notification, this can be deliberately harder to overlook. | AlarmKit supports authorized alarms that can override Focus/silent mode. User must enable it and authorize alarms. Treat it as a real scheduled alarm, not a trick to force ordinary reminders through. Allow stop/snooze and cancellation after completion; optional default-off. |
| Optional opt-in | Evening Live Activity | During a chosen evening window, Lock Screen/Dynamic Island shows current calories and “Food check pending,” with a route to review. End after confirmation. | ActivityKit + WidgetKit; use a bounded evening session, not an always-on 24-hour tracker. Activity lifetime is limited; updates/visibility remain under system control. May need explicit start or a properly designed native/server scheduling path. |
| Motivation polish | Haptics and milestone feedback | A short satisfying response to a completed check; a brief milestone celebration when sufficient trend data support it. | Haptics/reduced-motion-aware animation, no loops, no fabricated progression. Reward honest logging and returning after a miss; do not grant extra rewards for eating progressively less or punish corrections. |
| Later | Photo capture alignment | Show a framing guide; offer same-size before/after comparisons with manual adjustment. | Apple Vision body landmarks can inform uniform translation/scale, but pose, perspective, clothing, and confidence limit accuracy. Preserve originals; no warping, weight-loss synthesis, or AI beauty editing. Guided capture before auto-alignment. |
| Later | Short AI reviews | A factual weekly note: forgotten snacks were added on two nights; choose one next action. A “Help me check in” path when the user is about to skip logging. | Use actual records, distinguish unknown from over target, and cite app dates/totals. Optional on-device Foundation Models capability spike; device/model availability must be checked. Cloud ChatGPT requires a later backend, user-controlled data sharing, and secrets kept off the phone. Never infer diagnoses or give body-shaming judgments. |
| Later | Accountability sharing | Preview a weekly summary of logging, exercise, and trend; choose whether to share with accountability partner. | User-triggered share sheet initially. Photos private by default. No messages sent automatically; recurring sharing requires separate explicit setup. |
| Later, if wanted | Apple Watch companion | Quick Taken/Done actions and a glanceable pending food check. | Only worth building if the user uses a compatible Watch. Watch app/complications require additional native targets and synchronization; not a first-build dependency. |

## Reminder policy
Configuration has its own Settings → Reminders screen; no permanent reminder footer on the dashboard. Offer a small number of user-selected reminders near genuine trouble periods, not an hourly stream. Suggested dinner and pre-bed times are not settled. Handle weekday/weekend schedules separately. Each reminder knows which action is outstanding, offers a bounded snooze, and stops for that day after completion without disabling future days. Surface permission/disabled states clearly in Reminders settings. Schedule recurring local notifications without relying on the app running at the scheduled time; investigate cancellation/refresh races on-device. An OS alert cannot prove that food was logged, photos were reviewed, or a workout happened.

## Motivation policy
Keep real numbers and the line graph as the main reward. The four-check calendar is a habit summary, not a clinical health score. Green 4/4; yellow 1–3/4; red known 0/4; grey unreported; future neutral. Food completeness earns its own check even when over target. A 1/4 day can visibly become 2/4 or 3/4. Correcting a mistaken log is success for honesty, not a reason to lose everything. Avoid a giant streak that resets all progress after one missed day. Optional badges can reflect cumulative complete logs and verified trend milestones, but any reward system must be specified separately before implementation.

## Integration spike acceptance
1. Verify actual VeSync scale, workout app, and MFP write samples to Apple Health on the user's iPhone. Read-only requests for the needed types first; empty/unavailable not zero.
2. Compare today's and yesterday's totals and weight samples with source apps; test edits/deletions, duplicate sources, midnight and daylight-saving changes. Retain UUID/source and last-sync provenance.
3. Widget and app share one authoritative action contract. Tap widget Taken, reload the app, edit to No: all surfaces agree; repeat taps are idempotent.
4. Reminder actions and late snoozes cannot accidentally change another date's record. Updating a confirmed calorie total preserves history and reopens confirmation.
5. On-device alarm test with permission allowed/denied, Focus, silent mode, stop/snooze, and app not foregrounded. Never claim normal notifications are alarms.
6. Check iPhone safe areas, Dynamic Type, Reduce Motion, readable contrast, and calendar touch targets. Visible freshness when background refresh is delayed.

## Technical split
- React Native/TypeScript: screens, chart/calendar, themes, shared business rules, persistence, edit/review flows.
- Swift + app extensions: WidgetKit, App Intents, ActivityKit, AlarmKit, HealthKit adapters, later Vision/Watch capabilities.
- App Group: carefully versioned shared storage/action coordination. Do not treat JS AsyncStorage alone as a shared native-extension database; define concurrency and migration before widget work.
- Backend: not needed for the offline first slice. NUC or managed hosting may later support cloud AI, backups, authenticated sharing, APNs Live Activity updates; choose only when those are implemented.

## Primary references
- Apple iOS 27: https://www.apple.com/os/ios/
- Widget interactions: https://developer.apple.com/documentation/widgetkit/adding-interactivity-to-widgets-and-live-activities
- WidgetKit foundations, WWDC26: https://developer.apple.com/videos/play/wwdc2026/277/
- App Intents: https://developer.apple.com/documentation/appintents
- System controls: https://developer.apple.com/documentation/widgetkit/creating-controls-to-perform-actions-across-the-system
- Actionable notifications: https://developer.apple.com/documentation/usernotifications/handling-notifications-and-notification-related-actions
- AlarmKit scheduling: https://developer.apple.com/documentation/alarmkit/scheduling-an-alarm-with-alarmkit
- Live Activity lifecycle: https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities
- HealthKit: https://developer.apple.com/documentation/healthkit
- MyFitnessPal Apple Health behavior: https://support.myfitnesspal.com/hc/en-us/articles/360032271092-Apple-Health-connection-and-syncing
- Body-pose detection: https://developer.apple.com/documentation/vision/detecting-human-body-poses-in-images
- Foundation Models: https://developer.apple.com/documentation/foundationmodels
- Expo development builds/native split: https://docs.expo.dev/workflow/overview/

The proposals in this document are product design inferences from these capabilities, not claims that integrations already work or guarantee adherence.
