# Backend implementation checkpoint

Supabase project `teqocbxdkdoiwzqwcqsi` is dedicated to ON TRACK. The app works locally without an account. Authenticated users can explicitly save immutable versioned record snapshots, preview a restore and retain local recovery data. This is manual backup, not automatic sync or conflict-merging across devices.

Owner-only RLS protects backups and provisioned private-photo storage. Photo upload/backup is not yet exposed by the app; photos remain device-local. Publishable client configuration is public by design; no privileged server key belongs in this repository. Auth refresh sessions use chunked SecureStore, not AsyncStorage.

The deployed `weekly-coach` function validates the signed-in user, accepts bounded numerical review facts, and enforces five requests per UTC day. OpenAI generation needs server-only `OPENAI_API_KEY` and `OPENAI_MODEL`; neither is configured by this source handoff. The user must explicitly consent before facts are sent. No photos, free-form diary or automatic health upload are included.

See [backend setup and verification](../supabase/README.md) and committed migrations/tests. Authenticated device backup/restore and Keychain roundtrip still need real-device testing. Automatic sync, cloud photo transfer and notifications/APNs are later slices.
