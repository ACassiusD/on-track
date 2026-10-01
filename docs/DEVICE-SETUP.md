# Device setup

The repository root is the Expo app. Use Node 22.13+ (CI uses Node 24).

```sh
git clone https://github.com/ACassiusD/on-track.git
cd on-track
npm ci
npm start
```

## Windows and Android

Use Android Studio's Device Manager to start an emulator, then press `a` in Expo CLI. Shared screens, daily checks, calorie revisions, graph/calendar, photos, and local persistence can be exercised on Android. Apple Health, Siri, WidgetKit, Live Activities, and AlarmKit require iOS and cannot be verified on Android.

## Physical iPhone

For standalone testing with updates from GitHub, follow [iPhone test updates](IPHONE-TEST-UPDATES.md). The development build below is for local Metro debugging.

Expo Go can preview the common UI only while its installed SDK matches this project. Native modules/extensions require a development build. Sign in to your own Expo account and register the iPhone through the EAS workflow; Apple provisioning is required for a physical development build. No credentials or Apple signing assets belong in Git.

```sh
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client
```

These are setup instructions, not executed build results. Read the native feature guide for App Group, widgets, HealthKit, and capability configuration before building. Cloud builds may incur account-specific costs; review them before starting. On a Mac, Xcode/iOS Simulator can also be used. The iOS simulator does not run on Windows.

## First device checks

- Personal mode starts empty; demo history never appears as personal data.
- Food audit, confirmed total edit, and undo survive app termination.
- Yesterday/today around 1 am, DST, and Monday switch behave correctly.
- Photo picker/export/removal and app-private originals work after relaunch.
- Reminders permission denied/allowed, snooze, termination and no duplicate actions.
- VoiceOver, larger text, keyboard, contrast, and small iPhone layout.
- Verify each native capability on the real device before calling it working.

## GitHub native compilation

`.github/workflows/ios-build.yml` generates the native project, installs CocoaPods, and attempts an unsigned simulator build on GitHub's standard `macos-26` runner. This needs no Apple signing secrets. Its outcome is recorded in GitHub Actions; adding the workflow is not a claim that the build has passed. A successful simulator build still does not verify HealthKit data, actual notification/alarm delivery, or iPhone provisioning.
