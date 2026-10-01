import AppIntents
internal import OnTrackIPhone

@available(iOS 16.4, *)
struct TakenCreatineIntent: AppIntent {
  static var title: LocalizedStringResource = "Mark creatine taken today"
  static var description = IntentDescription("Records creatine for today's calendar date. Open ON TRACK to undo or select a different date.")
  static var openAppWhenRun = true
  func perform() async throws -> some IntentResult & ProvidesDialog {
    try OnTrackActionInbox.append(kind: "creatine")
    return .result(dialog: "Creatine recorded for today. You can undo it in ON TRACK.")
  }
}

@available(iOS 16.4, *)
struct WorkedOutIntent: AppIntent {
  static var title: LocalizedStringResource = "Mark workout done today"
  static var description = IntentDescription("Records your workout for today's calendar date. Open ON TRACK to undo or select a different date.")
  static var openAppWhenRun = true
  func perform() async throws -> some IntentResult & ProvidesDialog {
    try OnTrackActionInbox.append(kind: "workout")
    return .result(dialog: "Workout recorded for today. You can undo it in ON TRACK.")
  }
}

@available(iOS 16.4, *)
struct OnTrackShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(intent: TakenCreatineIntent(), phrases: ["I took creatine in \(.applicationName)"], shortTitle: "Creatine taken", systemImageName: "checkmark.circle")
    AppShortcut(intent: WorkedOutIntent(), phrases: ["I worked out in \(.applicationName)"], shortTitle: "Workout done", systemImageName: "figure.strengthtraining.traditional")
  }
}
