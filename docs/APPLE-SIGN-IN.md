# Sign in with Apple

The iPhone account screen uses Apple's native button and authorization sheet. A random 32-byte nonce is hashed with SHA-256 for Apple and sent in its original form to Supabase with the identity token. Supabase verifies the signed token and nonce and creates a normal account session, retained in the existing Keychain storage. Backup ownership continues to use `auth.uid()`.

Only email access is requested; Apple supports Hide My Email. No password or full name is collected through this flow. Cancelling leaves records unchanged. Automatic backup remains an explicit choice after sign-in, and restoring saved stats remains previewed.

## Hosted provider setup

In [the ON TRACK Supabase authentication providers](https://supabase.com/dashboard/project/teqocbxdkdoiwzqwcqsi/auth/providers), enable Apple and include `com.acassiusd.ontrack` in **Client IDs**. Native-only ID-token login does not require a Services ID or OAuth signing secret. Keep nonce verification enabled. Add `host.exp.Exponent` only if deliberately testing through Expo Go.

The connected Supabase MCP tools do not expose auth-provider configuration. The live provider was disabled when this feature was implemented, so login reports that it is unavailable before presenting Apple authorization until the dashboard setting is enabled.

## iPhone build

`app.json` enables `ios.usesAppleSignIn` and the `expo-apple-authentication` plugin. Native prebuild generates the `com.apple.developer.applesignin` entitlement with `Default`. Enable Sign in with Apple for the app's identifier in the Apple Developer portal, and regenerate its provisioning profile if EAS requests it.

This feature changes the native runtime and requires installing a new preview build. Install over the existing app without deleting it. Fingerprint matching prevents the new OTA bundle reaching incompatible older builds.

The **Build installable iPhone test app** GitHub workflow uses the existing Expo token and preview profile for changes to native configuration or dependencies, and can be run manually. It waits for the signed build and logs its EAS install URL. If credentials need repair, run `npx eas-cli@latest build --platform ios --profile preview` on a signed-in development machine and complete Apple's prompts once; future builds reuse those credentials.

## Verification

Domain tests cover nonce routing, cancellation, missing tokens, disabled providers and exchange failure. Typecheck, lint, iOS export and isolated prebuild validate the app wiring. Real-device Apple authorization and a successful Supabase session must be tested after enabling the live provider and installing the signed build.

Email accounts remain available. An Apple private relay email may identify a separate account from an existing email/password login; use the original account to access its existing cloud backups unless account linking is explicitly implemented.
