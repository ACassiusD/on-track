# iPhone native feature slice

The first iPhone integrations now have source code, not just switches. They require a **development build**, provisioning, and an actual device test before being called working on the user’s phone. Android and Expo Go keep manual/local flows; they do not simulate connected Apple services.

## Included

- **HealthKit read-only local Expo module**: weight in pounds, workout samples, dietary energy in kcal, UUID/start/end/source app identifiers. Requests only read access, never writes Health data. Authorization completion is not proof of granted read permission; empty reads remain unknown. Maximum 93-day request, explicit failure above 10,000 samples per type instead of silently truncating totals.
- **Health preview/import screen**: 30-day reads, weight UUID upserts, explicitly selected calorie source/day, manual confirmation of qualifying workouts. Calorie imports replace one selected source’s total, reopen food completeness, and use the domain revision function when a confirmed total changes. Multiple energy exporters are never blindly summed together. Strength workouts or workouts lasting at least 20 minutes qualify for a check. Imported dates use the current device time zone, visibly stated in the UI.
- **Glanceable WidgetKit widgets** through the official Expo SDK 57 `expo-widgets` library: small/medium Home Screen and rectangular/inline Lock Screen. Calorie total/bar, trend weight/coverage, date, freshness, pending food check. Medium widgets deep-link to daily checks. A next-midnight timeline entry clears yesterday’s answers. Widgets show saved projections; system refresh is not guaranteed immediate.
- **Siri/App Shortcuts**: “I took creatine in ON TRACK” and “I worked out in ON TRACK.” They explicitly record today’s calendar date and open the app. App Group context must already say personal mode/current date; missing/stale/demo context rejects the action. No calorie or food-completeness intent is exposed.
- **Durable native action inbox**: each shortcut writes an independent UUID JSON file atomically into the App Group. App persists the receipt ID together with the business change before deleting that exact native file. If acknowledgement fails, the next drain sees the persisted receipt and does not repeat the change. A concurrent new file cannot be erased by acknowledgement. AsyncStorage remains the app authority. Native code never edits the app’s JSON state.
- **Evening Live Activity**: explicit start/end, calorie total and food-review link on Lock Screen/Dynamic Island. Existing session metadata is stored separately to survive app process restarts. It becomes stale after two hours and is ended on completion, demo mode, or expired session when the app next runs reconciliation. **Stale date is not a guaranteed background termination timer**. iOS controls display and maximum lifetime; no APNs/backend continuous updates are configured.
- **Optional one-off AlarmKit alarm**, iOS 26+: deliberate authorization, explicit date/time preview, real system alert and Stop, manual cancellation. This is an actual AlarmKit call, not an ordinary notification relabeled as an alarm. It may override silent mode/Focus. Saved food completion cancels associated alarms when the app reconciles. No automatic nightly recurrence or snooze in this slice. Alert-only presentation avoids claiming a custom countdown extension has been implemented.

No health data or photos are exposed through widgets or shortcut receipts beyond the explicit numerical progress projection. Photos are not added to the App Group.

## Configuration and wiring

`app.json` uses `ios.bundleIdentifier = com.acassiusd.ontrack`; the widget bundle is derived as `com.acassiusd.ontrack.ExpoWidgetsTarget`; App Group is `group.com.acassiusd.ontrack`. The native config plugin must precede/agree with the Expo Widgets plugin:

```json
[
  ["./plugins/with-on-track-iphone", { "groupIdentifier": "group.com.acassiusd.ontrack" }],
  ["expo-widgets", {
    "groupIdentifier": "group.com.acassiusd.ontrack",
    "widgets": [{
      "name": "OnTrackProgress",
      "displayName": "ON TRACK",
      "description": "Calories, weight trend, and daily checks",
      "ios": { "supportedFamilies": ["systemSmall", "systemMedium", "accessoryRectangular", "accessoryInline"] }
    }]
  }]
]
```

The local module under `modules/on-track-iphone` is automatically discovered by Expo autolinking. `with-on-track-iphone` sets the HealthKit capability, Health read description, AlarmKit usage description, App Group, and adds `OnTrackIntents.swift` to the **application target** so App Intents metadata extraction sees it. It generates native files through prebuild; do not edit generated `ios/` files manually.

`src/native/iphone.ts` is safe on Android/Expo Go: optional native module discovery, unavailable status, no fake permission success. Root `IPhoneStore` should publish native context after hydration and mode/date changes, consume valid receipts through durable `commit`, and call `cancelResolvedReviewAlarms`. It should dynamically import `iphoneWidgets` only when `getIPhoneStatus().widgetsAvailable` is true; `expo-widgets`’ iOS package requires its native module and is absent from Expo Go.

`publishIPhoneSnapshot(state, today)` writes the widget projection. `syncEveningActivities(state)` reconciles the active session after saves/foreground changes. `startEveningActivity(state, date)` is an explicit user action. This is a projection, not a second editable database.

## Known limits and next device checks

1. Swift source has **not been compiled** on macOS or an EAS iOS build. Native signing, intents discovery, widget bundle/runtime serialization, AlarmKit APIs and actual Health sample behavior need verification.
2. Apple Developer provisioning must include HealthKit and the registered App Group for the app and widget target. A real iPhone development build is needed; iOS simulator/Android cannot validate the user’s scale/source connections. Choose the Apple team interactively rather than guessing account credentials. No cloud build was submitted by this worker.
3. Health samples use a bounded snapshot read, not an anchored background subscription. UUID edits upsert, but deleted Health weight samples are **not automatically removed**. Source deletion/revocation cannot be inferred from empty results. Need anchored queries, deletions, and source-calendar reconciliation before automatic sync.
4. MyFitnessPal summaries may lack meaningful meal timestamps. Device-calendar projection is displayed, and imported calories remain a reviewed daily total rather than evidence that dinner/snacks were complete.
5. Native shortcut actions are provisional until the app persists them; Siri success means the receipt was written. The app opens to complete saving. Native context blocks demo/current-date mismatch. Test midnight/late-night workflows and intentional undo after an intent.
6. Widgets offer deep links for habit editing. Background interactive Taken/Done widgets need a durable action contract shared with the native inbox; listening only for Expo widget taps while the app is alive would lose changes after process death, so that shortcut was deliberately not implemented.
7. AlarmKit is one-off, alert-only; nightly calendar recurrence and real system snooze/countdown need a separate matching AlarmKit widget extension plus more tests. Future alarms are fixed instants; changing time zone does not retime one automatically. Full-screen delivery, Focus/silent behavior, stop, denied permission, process termination and cancellation must be tested on-device.
8. Evenings become stale after two hours; the app cannot guarantee an exact background end at that instant. No APNs tokens or server notification scheduling is configured. No Live Activity starts automatically.

## Validation completed here

- TypeScript typecheck and Expo lint pass for the new native TypeScript/UI.
- Five native contract tests pass: action/date validation; selected-source calorie deduplication/unknown vs zero; saved-target widget projection/next-day unknowns; bounded activity completion/expiry/demo; stable App Group validation.
- `expo-modules-autolinking resolve --platform apple --json` finds `on-track-iphone`, `OnTrackIPhone` pod, and `OnTrackIPhoneModule`.
- **Isolated** `expo prebuild --platform ios --no-install` passes. Generated main app source phase contains `OnTrackIntents.swift`; widget target contains `OnTrackProgress`; main and widget entitlements share the App Group; main includes HealthKit and both usage-description keys. This checks project generation, not CocoaPods compilation or device execution.

## Primary documentation checked

- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/versions/v57.0.0/sdk/widgets/
- https://docs.expo.dev/modules/module-api/
- https://docs.expo.dev/modules/autolinking/
- https://docs.expo.dev/config-plugins/plugins/
- https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data
- https://developer.apple.com/documentation/healthkit/hkhealthstore/requestauthorization(toshare:read:)
- https://developer.apple.com/documentation/alarmkit/scheduling-an-alarm-with-alarmkit.md
- https://developer.apple.com/documentation/alarmkit/alarmmanager/alarmconfiguration/alarm(schedule:attributes:stopintent:secondaryintent:sound:).md
- https://developer.apple.com/documentation/alarmkit/alarmbutton/init(text:textcolor:systemimagename:).md
- https://developer.apple.com/documentation/alarmkit/alarm/schedule-swift.enum/fixed(_:).md
- https://developer.apple.com/documentation/appintents
