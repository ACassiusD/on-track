# iPhone test updates

The **preview** profile is a standalone, internally distributed release build on the **testing** update channel. Install it once, then download compatible updates in Settings without TestFlight or a running Mac. Development builds remain available for Metro debugging.

## Link your Expo account on your Mac

From the repository root:

```sh
git pull
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npm run setup:updates
```

Choose your Expo account and create/link the **on-track** project. Init records the public project ID in app.json; the setup script derives the update URL and preserves the fingerprint runtime policy.

Commit the linked configuration so your build and CI target the same project:

```sh
git add app.json
git commit -m "Link Expo project for iPhone test updates"
git push
```

## Install on your iPhone

```sh
npx eas-cli@latest device:create
npx eas-cli@latest build --platform ios --profile preview
```

Follow the registration link on your iPhone. Select your own Apple Developer team when EAS asks about signing. This internal iPhone distribution route needs a paid Apple Developer membership. When the build completes, open its install link on the registered phone. The initial build may surface Swift or capability issues which need fixing before installation; the custom native integrations have not yet been physically verified.

For the same standalone update behavior in Simulator, use **preview-simulator**. Physical-device and simulator binaries are different. Use **development** or **simulator** plus `npm start -- --dev-client` for local debugging.

## Activate CI

1. Create a token at https://expo.dev/settings/access-tokens.
2. Add it as repository secret **EXPO_TOKEN** at https://github.com/ACassiusD/on-track/settings/secrets/actions. Keep the token out of source and chat.
3. Add repository variable **EAS_UPDATES_ENABLED** = **true** at https://github.com/ACassiusD/on-track/settings/variables/actions.
4. Run **Publish iPhone test update** from GitHub Actions, or push the next change to main.

The workflow runs typecheck, lint and tests before publishing an iOS update to **testing**, using the **preview** EAS environment. It stays disabled until that repository variable is enabled and never publishes to production. Any public build-time environment values must match between the preview build and its updates.

Open **Settings → Get latest test version**. The button checks and downloads the latest compatible update, waits for record writes and restarts the app. The update ID identifies the running version. Hard reset is available in testing builds too. Production omits these testing controls.

## Native changes

UI, JS logic, vector pet animations and assets can update remotely. The fingerprint runtime policy prevents incompatible updates from loading in older builds. Native libraries, Swift, SDK and capability changes still need another preview build/install. CI does not automatically create signed builds or spend build credits. A published OTA update does not verify native compilation or device behavior.

Manual publish:

```sh
npx eas-cli@latest update --channel testing --environment preview --platform ios --message "Manual test update"
```

References: https://docs.expo.dev/eas-update/getting-started/ and https://docs.expo.dev/versions/v57.0.0/sdk/updates/.
