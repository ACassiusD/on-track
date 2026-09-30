# ON TRACK — React Native coding handoff

Approved product direction, September 30, 2026.

**Stay on track. Stay motivated.**
ADHD-friendly daily follow-through and visual motivation are the two core product goals. This is a personal accountability tool, not an ADHD diagnosis/treatment app. Plain labels and low effort matter more than feature count.

## Start here
Build a native React Native + TypeScript iPhone app from the supplied interactive HTML references. They are visual/interaction specifications, not production screens: do not ship a WebView wrapper. Neon Arcade is the default. Cozy Quest, Pocket Arcade, and Classic (previous blue/violet design) are Settings themes. Keep the same navigation and features across themes; use Neon layout as the canonical layout rather than preserving earlier layout experiments.

Canonical repository: https://github.com/ACassiusD/on-track. The native starter lives at the repository root. Choose the currently supported Expo SDK through official tooling; avoid guessing compatible versions. Plan development builds and Swift modules/extensions for iOS features. Expo Go alone will not cover HealthKit, AlarmKit, widgets, and Live Activities. Repository source updates are authorized. App releases, cloud account setup, and messages require separate instructions. No NUC backend needed in version one.

## Approved dashboard
1. Header with Photos and Settings destinations.
2. Top prompts: Workout today? Yes/No; Creatine taken? Yes/No. Hide each after either answer. Preserve the value. Edit today's checks reopens answered prompts with selected values; Done hides them again. Workout means any lifting/cardio/both; no exercises, sets, or food database.
3. Prominent daily calorie total, target, remaining/over text, ordinary bar, Update calories, Everything I ate is logged. Target editable; 1,950 in references is demo data, not an agreed prescription. Never silently choose 1,700 from historical context.
4. Weight number and downward trend line; milestones based on seven-day average, not one weigh-in. Show measurement coverage. Next demo milestone 172 lb; longer demo goal 155 lb. Configurable; minimum coverage for earning milestones still open.
5. Previous calendar week plus current calendar week, Monday–Sunday fixed columns. Highlight today. Advance a whole week on Monday; this is not a rolling 14-day window. Future dates neutral. Tapping a day opens its four-check breakdown.
6. Remove the permanent Food review reminder footer from every theme. This label in HTML is obsolete. Schedule configuration belongs in Settings → Reminders.
7. Each stats section has Details. Keep the initial dashboard compact for a standard iPhone; support Dynamic Type and smaller phones with scrolling rather than clipping.

## Four independent checks
- Creatine taken: true / false / unknown.
- Any workout done: true / false / unknown.
- Food fully logged: true / false / unknown; explicit user acknowledgment.
- Within calorie target: derived. Confirm success only when the food log is complete. A known total over target can show failure before completeness; a partial low total is unknown.

A complete over-target day earns the logging check. An imported total never proves food completeness.
Green = 4/4. Yellow = 1–3/4, with count visible. Red = 0/4 only with all results known. Grey = no successes and some unknown results. Future days neutral. Show individual unknown answers when drilling in. This is an action summary, not a health score; do not give creatine completion medical meaning. Do not replace counts with fabricated XP, ranks, or streaks.

## Confirmation and revisions
Confirmation means all food was logged, not a calorie cap, lock, or prohibition on further eating. First show a short audit (snacks/small bites; drinks/sauces). Updating a confirmed total reopens confirmation. Record immutable old total, new total, time, reason, source, and linked original confirmation; multiple revisions versus distinct revised days are separate counts. Reasons: forgotten food, ate afterward, estimate correction, unspecified. Corrections keep honesty credit; do not punish edits. Photo review is independent of calorie confirmation.

## Data and dates
Use durable local persistence; never use demo history as real user records. Support a clearly separated demo mode and empty real mode. Store dates and instants separately, retain source provenance and timezone. Use the current device timezone and an explicit overnight date choice. A configurable late-night review cutoff is proposed, not settled: preserve Apple Health source calendar dates and let users explicitly choose yesterday/today for late manual entries. Tests must cover midnight, Monday, month/year boundaries and daylight saving changes.

Suggested entities: preferences (theme, targets, milestone list, reminder schedule), DailyRecord (localDate, calorieTotal nullable, foodState, workoutState, creatineState, sources), Confirmation, Revision, WeightReading, PhotoRecord (local URI, capture date, reference choice, uniform scale/x/y), ReminderRecord. App group/native integration adapters should invoke the same business actions as the app, not maintain independent totals.

## Photos
Private by default; explicit system picker, persistent local copy, timeline, side-by-side/slider/flip. Uniform scaling and translation for alignment; never reshape the body or synthesize a fake transformation. Provide guided capture framing later. Never expose body photos in widgets/notifications by default. Original photos retained; transformations stored separately. Girlfriend sharing is a future opt-in preview-and-send flow, not automatic messaging.

## First implementation slice
Build the local native UI, persistent daily state, real fixed-week calendar, calorie confirmation/revisions, weight trend/milestones, four themes, Settings/Reminders shell, and independent photo flow. Implement native integrations in later slices behind explicit capability states; unavailable is not zero. Add meaningful tests for scoring, source reconciliation, revisions, date windows, storage hydration, and empty data; verify touch sizes and contrast.

## Native feature roadmap
See IOS-FEATURE-PLAN.md. Highest-value follow-up: actionable local reminders and interactive Home/Lock Screen widgets. HealthKit import follows a source-availability spike. AlarmKit, App Intents, and optional evening Live Activity need native Swift/extension work and permission/device verification. Never label a stub Connected or Working. AI and sharing need a later backend and explicit setup.

## Acceptance scenarios
- Yes workout hides only workout prompt and updates today's calendar; No creatine hides its prompt without awarding a check. Edit restores both selected answers.
- Complete 2,200 kcal at demo target 1,950 gives logging success and calorie failure.
- Unconfirmed 1,400 gives no within-target success.
- 4/4 is green; 3/4 and 1/4 both yellow but distinct counts; no data grey; future neutral.
- Later edits reopen completeness, retain every revision, and recalculate the calendar.
- Sunday/Monday changes switch previous/current whole weeks correctly, including September/October and December/January.
- Manual entries and imported samples never double-count. Imported food cannot auto-confirm completeness.
- Reload restores local state and theme; no sample data appear in real mode.
- Reminders and photo review do not clutter or block calorie check-in.

## Reference status
The HTML references were checked with local interaction tests; no iOS app or device rendering existed before this handoff. Treat all reference numbers/history/photos as illustrative. Settings and reminder integrations are not implemented in HTML.
